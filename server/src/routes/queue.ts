import { Router } from 'express';
import { QueueEngine } from '../services/queueEngine.js';
import { StorageService } from '../services/storage.js';

export const queueRouter = Router();
const queueEngine = QueueEngine.getInstance();
const storage = StorageService.getInstance();

// POST /api/queue/request - submit access request & get token
queueRouter.post('/request', async (req, res) => {
  const { registrationNumber, labId, purpose, requestedDurationMinutes, requestDate } = req.body;

  if (!registrationNumber || !labId || !purpose || !requestedDurationMinutes) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: registrationNumber, labId, purpose, and requestedDurationMinutes are mandatory.'
    });
  }

  const result = await queueEngine.submitAccessRequest({
    registrationNumber,
    labId,
    purpose,
    requestedDurationMinutes: Number(requestedDurationMinutes),
    requestDate
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

// GET /api/queue/token/:id - get status, countdown, and queue standing for a token
queueRouter.get('/token/:id', (req, res) => {
  const standing = queueEngine.getQueueStanding(req.params.id);
  if (!standing) {
    return res.status(404).json({ success: false, error: 'Token not found.' });
  }

  const lab = storage.getLabById(standing.token.labId);
  const now = Date.now();

  // Compute remaining countdown seconds if status is "Your turn"
  let remainingCallSeconds: number | null = null;
  if (standing.token.status === 'Your turn' && standing.token.callExpiryTimestamp) {
    remainingCallSeconds = Math.max(0, Math.round((standing.token.callExpiryTimestamp - now) / 1000));
  }

  res.json({
    success: true,
    standing,
    laboratory: lab ? { id: lab.id, name: lab.name, location: `${lab.building}, ${lab.roomNumber}` } : null,
    serverTime: now,
    remainingCallSeconds
  });
});

// GET /api/queue/student/:regNo - get all tokens associated with a registration number
queueRouter.get('/student/:regNo', (req, res) => {
  queueEngine.checkAndExpireNoShows();
  const regNoUpper = req.params.regNo.trim().toUpperCase();
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
queueRouter.post('/token/:id/cancel', async (req, res) => {
  const { reason } = req.body;
  const result = await queueEngine.cancelToken(req.params.id, reason);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});
