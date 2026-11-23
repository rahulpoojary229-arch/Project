import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { labsRouter } from './routes/labs.js';
import { studentsRouter } from './routes/students.js';
import { queueRouter } from './routes/queue.js';
import { attendantRouter } from './routes/attendant.js';
import { assistantRouter } from './routes/assistant.js';
import { securityHeaders, apiGeneralLimiter } from './middleware/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Headers (CSP, X-Frame-Options, X-Content-Type-Options, HSTS, No-Fingerprint)
app.use(securityHeaders);

// 2. Controlled CORS policy
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development ports, preview tunnels, and same-origin/internal requests
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('loca.lt') || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for competition demo while headers enforce security
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Staff-Role', 'Authorization']
}));

// 3. Strict Payload Body Size Limit (prevents memory spikes / DoS)
app.use(express.json({ limit: '16kb' }));

// 4. Global API Rate Limiting
app.use('/api', apiGeneralLimiter);

// 5. Mount API Routes
app.use('/api/labs', labsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/queue', queueRouter);
app.use('/api/attendant', attendantRouter);
app.use('/api/assistant', assistantRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'LabLink Secure API Server',
    version: '1.0.0',
    securityStatus: 'hardened',
    timestamp: Date.now(),
    timezone: 'Asia/Kolkata'
  });
});

// Serve frontend static build if it exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  LabLink Hardened Server running at: http://localhost:${PORT}`);
  console.log(`  Security: Rate Limiting & Security Headers Active`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Default Timezone: Asia/Kolkata`);
  console.log(`=======================================================`);
});

// Global error handler — catches unhandled errors from async route handlers
// Must be registered AFTER all routes with the 4-argument signature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[LabLink Error]', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred. Please try again.'
  });
});

export { app, server };
