import { Router } from 'express';
import { QueueEngine } from '../services/queueEngine.js';
import { StorageService } from '../services/storage.js';
import { queueSubmissionLimiter, validateQueueRequestInput, maskStudentName } from '../middleware/security.js';

export const queueRouter = Router();
const queueEngine = QueueEngine.getInstance();
const storage = StorageService.getInstance();

// POST /api/queue/request - submit access request & get token (Protected with Rate Limiter & Input Validator)
queueRouter.post('/request', queueSubmissionLimiter, validateQueueRequestInput, async (req, res, next) => {
  try {
    const { registrationNumber, labId, purpose, requestedDurationMinutes, requestDate } =
      req.body as {
        registrationNumber: string;
        labId: string;
        purpose: string;
        requestedDurationMinutes: number;
        requestDate?: string;
      };

    const result = await queueEngine.submitAccessRequest({
      registrationNumber,
      labId,
      purpose,
      requestedDurationMinutes: Number(requestedDurationMinutes),
      requestDate
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/queue/token/:id - get status, countdown, and queue standing for a token
queueRouter.get('/token/:id', (req, res) => {
  const tokenId = String(req.params.id);
  const standing = queueEngine.getQueueStanding(tokenId);
  if (!standing) {
    res.status(404).json({ success: false, error: 'Token not found.' });
    return;
  }

  const lab = storage.getLabById(standing.token.labId);
  const now = Date.now();

  // Compute remaining countdown seconds if status is "Your turn"
  let remainingCallSeconds: number | null = null;
  if (standing.token.status === 'Your turn' && standing.token.callExpiryTimestamp) {
    remainingCallSeconds = Math.max(0, Math.round((standing.token.callExpiryTimestamp - now) / 1000));
  }

  // Clone token and privacy-mask name for public display
  const sanitizedToken = {
    ...standing.token,
    studentName: maskStudentName(standing.token.studentName)
  };

  res.json({
    success: true,
    standing: {
      ...standing,
      token: sanitizedToken
    },
    laboratory: lab ? { id: lab.id, name: lab.name, location: `${lab.building}, ${lab.roomNumber}` } : null,
    serverTime: now,
    remainingCallSeconds
  });
});

// GET /api/queue/student/:regNo - get all tokens associated with a registration number
queueRouter.get('/student/:regNo', (req, res) => {
  queueEngine.checkAndExpireNoShows();
  const regNoUpper = String(req.params.regNo).trim().toUpperCase();
  const allTokens = storage.getAllTokens();

  const studentTokens = allTokens
    .filter(t => t.registrationNumber.toUpperCase() === regNoUpper)
    .sort((a, b) => b.submittedTimestamp - a.submittedTimestamp);

  const tokensWithStanding = studentTokens.map(token => {
    const standing = queueEngine.getQueueStanding(token.id);
    const lab = storage.getLabById(token.labId);
    return {
      token,
      standing,
      labName: lab?.name || token.labId
    };
  });

  res.json({ success: true, count: tokensWithStanding.length, tokens: tokensWithStanding });
});

// POST /api/queue/token/:id/cancel - cancel an active request
queueRouter.post('/token/:id/cancel', async (req, res, next) => {
  try {
    const tokenId = String(req.params.id);
    const { reason } = req.body as { reason?: string };
    const result = await queueEngine.cancelToken(tokenId, reason);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});
