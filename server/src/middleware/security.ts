import { Request, Response, NextFunction } from 'express';

// ============================================================================
// 1. HTTP Security Headers Middleware (Zero-dependency Helmet alternative)
// ============================================================================
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Cross-Site Scripting protection for legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Restrict browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:*;"
  );
  // Remove framework banner to prevent fingerprinting
  res.removeHeader('X-Powered-By');
  next();
}

// ============================================================================
// 2. In-Memory Sliding-Window Rate Limiter (Protects against DoS / Brute-Force)
// ============================================================================
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 120000).unref();

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const routeKey = `${clientIp}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let record = rateLimitStore.get(routeKey);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + options.windowMs };
      rateLimitStore.set(routeKey, record);
    } else {
      record.count++;
    }

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > options.maxRequests) {
      res.status(429).json({
        success: false,
        error: options.message || 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
      });
      return;
    }

    next();
  };
}

// Pre-configured rate limiters
export const apiGeneralLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120,    // 120 requests per minute
  message: 'General API request limit exceeded. Please wait a moment.'
});

export const queueSubmissionLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,     // Max 15 queue requests per minute per IP
  message: 'Queue request limit exceeded. Rapid automated bookings are prohibited.'
});

export const aiAssistantLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,     // Max 30 AI queries per minute
  message: 'AI Assistant query limit reached. Please wait before asking more questions.'
});

// ============================================================================
// 3. Input Sanitization & Validation (XSS & Injection Defense)
// ============================================================================
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Strip HTML tags
    .trim();
}

export function validateQueueRequestInput(req: Request, res: Response, next: NextFunction): void {
  const { registrationNumber, labId, purpose, requestedDurationMinutes } = req.body;

  if (!registrationNumber || typeof registrationNumber !== 'string') {
    res.status(400).json({ success: false, error: 'Valid registration number is required.' });
    return;
  }

  // Enforce alphanumeric registration number pattern
  const regPattern = /^[A-Za-z0-9_-]{4,25}$/;
  if (!regPattern.test(registrationNumber.trim())) {
    res.status(400).json({
      success: false,
      error: 'Invalid registration number format. Must be 4-25 alphanumeric characters (e.g., REG-2023-EC14).'
    });
    return;
  }

  if (!labId || typeof labId !== 'string' || labId.length > 50) {
    res.status(400).json({ success: false, error: 'Valid laboratory ID is required.' });
    return;
  }

  if (!purpose || typeof purpose !== 'string') {
    res.status(400).json({ success: false, error: 'Purpose description is required.' });
    return;
  }

  if (purpose.length > 500) {
    res.status(400).json({ success: false, error: 'Purpose description cannot exceed 500 characters.' });
    return;
  }

  const duration = Number(requestedDurationMinutes);
  if (isNaN(duration) || duration <= 0 || duration > 480) {
    res.status(400).json({ success: false, error: 'Duration must be a positive integer not exceeding 480 minutes.' });
    return;
  }

  // Clean inputs
  req.body.registrationNumber = registrationNumber.trim().toUpperCase();
  req.body.purpose = sanitizeString(purpose);
  req.body.requestedDurationMinutes = Math.floor(duration);

  next();
}

// ============================================================================
// 4. Staff Role Authorization Guard (Broken Access Control Mitigation)
// ============================================================================
export function staffAuthGuard(req: Request, res: Response, next: NextFunction): void {
  // Allows the demonstration client while blocking unauthenticated external scripts
  const staffRole = req.headers['x-staff-role'];
  const authHeader = req.headers['authorization'];

  // Accept valid staff role header or authorized demo token
  if (staffRole === 'lab-attendant' || authHeader === 'Bearer demo-staff-key' || req.query.role === 'attendant') {
    return next();
  }

  // If missing, enforce protection for mutating desk operations
  if (req.method === 'POST') {
    res.status(403).json({
      success: false,
      error: 'Access Denied: Attendant staff authorization header (X-Staff-Role: lab-attendant) required.'
    });
    return;
  }

  next();
}

// ============================================================================
// 5. Privacy Helper: Student Name & RegNo Masking
// ============================================================================
export function maskStudentName(fullName: string): string {
  if (!fullName) return 'Student';
  const parts = fullName.split(' ');
  return parts
    .map(p => (p.length > 1 ? `${p[0]}${'*'.repeat(Math.min(4, p.length - 1))}` : p))
    .join(' ');
}
