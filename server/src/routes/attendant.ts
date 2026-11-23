import { Router } from 'express';
import { QueueEngine } from '../services/queueEngine.js';
import { StorageService } from '../services/storage.js';
import { staffAuthGuard } from '../middleware/security.js';

export const attendantRouter = Router();
const queueEngine = QueueEngine.getInstance();
const storage = StorageService.getInstance();

// GET /api/attendant/lab/:labId/queue - list all tokens for this lab
attendantRouter.get('/lab/:labId/queue', (req, res) => {
  queueEngine.checkAndExpireNoShows();
  const { labId } = req.params;
  const { date } = req.query;
  const targetDate = typeof date === 'string' ? date : storage.getCurrentDate();

  const lab = storage.getLabById(labId);
  if (!lab) {
    return res.status(404).json({ success: false, error: 'Laboratory not found.' });
  }

  const allDayTokens = storage.getTokensForLab(labId, targetDate);

  // Group tokens for clear attendant oversight
  const waitingTokens = allDayTokens.filter(t => t.status === 'Waiting')
    .sort((a, b) => {
      if (a.isCarryover && !b.isCarryover) return -1;
      if (!a.isCarryover && b.isCarryover) return 1;
      return a.submittedTimestamp - b.submittedTimestamp;
    });

  const calledTokens = allDayTokens.filter(t => t.status === 'Your turn');
  const arrivedTokens = allDayTokens.filter(t => t.status === 'Arrived');
  const inUseTokens = allDayTokens.filter(t => t.status === 'In use');
  const completedTokens = allDayTokens.filter(t => t.status === 'Completed');
  const expiredTokens = allDayTokens.filter(t => t.status === 'Expired');
  const cancelledTokens = allDayTokens.filter(t => t.status === 'Cancelled');

  const now = Date.now();

  res.json({
    success: true,
    laboratory: lab,
    currentDate: targetDate,
    serverTime: now,
    groups: {
      waiting: waitingTokens,
      called: calledTokens.map(t => ({
        ...t,
        remainingSeconds: t.callExpiryTimestamp ? Math.max(0, Math.round((t.callExpiryTimestamp - now) / 1000)) : 0
      })),
      arrived: arrivedTokens,
      inUse: inUseTokens.map(t => ({
        ...t,
        elapsedMinutes: t.sessionStartTime ? Math.round((now - t.sessionStartTime) / (60 * 1000)) : 0,
        isOverdue: t.sessionIntendedEndTime ? now > t.sessionIntendedEndTime : false
      })),
      completed: completedTokens,
      expired: expiredTokens,
      cancelled: cancelledTokens
    }
  });
});

// GET /api/attendant/lab/:labId/stats - summary statistics
attendantRouter.get('/lab/:labId/stats', (req, res) => {
  queueEngine.checkAndExpireNoShows();
  const { labId } = req.params;
  const lab = storage.getLabById(labId);
  if (!lab) {
    return res.status(404).json({ success: false, error: 'Laboratory not found.' });
  }

  const dayTokens = storage.getTokensForLab(labId);
  const waitingCount = dayTokens.filter(t => t.status === 'Waiting').length;
  const inUseCount = dayTokens.filter(t => t.status === 'In use').length;
  const servedCount = dayTokens.filter(t => t.status === 'Completed').length;
  const expiredCount = dayTokens.filter(t => t.status === 'Expired').length;
  const activeCount = dayTokens.filter(t => t.status !== 'Cancelled').length;
  const remainingCapacity = Math.max(0, lab.operatingSchedule.dailyStudentCapacity - activeCount);

  res.json({
    success: true,
    stats: {
      labId: lab.id,
      labName: lab.name,
      waitingStudents: waitingCount,
      currentlyUsing: inUseCount,
      servedToday: servedCount,
      expiredTokens: expiredCount,
      dailyCapacity: lab.operatingSchedule.dailyStudentCapacity,
      remainingCapacity
    }
  });
});

// All mutating attendant desk endpoints are guarded by staffAuthGuard:
attendantRouter.post('/token/:id/call', staffAuthGuard, async (req, res) => {
  const result = await queueEngine.callStudent(req.params.id);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

attendantRouter.post('/token/:id/arrived', staffAuthGuard, async (req, res) => {
  const result = await queueEngine.confirmArrival(req.params.id);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

attendantRouter.post('/token/:id/start-session', staffAuthGuard, async (req, res) => {
  const result = await queueEngine.startSession(req.params.id);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

attendantRouter.post('/token/:id/end-session', staffAuthGuard, async (req, res) => {
  const result = await queueEngine.endSession(req.params.id);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

attendantRouter.post('/token/:id/expire', staffAuthGuard, async (req, res) => {
  const { reason } = req.body;
  const result = await queueEngine.expireToken(req.params.id, reason);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

attendantRouter.post('/lab/:labId/close-day', staffAuthGuard, async (req, res) => {
  const { currentDate } = req.body;
  try {
    const result = await queueEngine.closeOperatingDay(req.params.labId, currentDate);
    res.json({
      success: true,
      message: `Operating day closed. ${result.carriedOverCount} unserved requests carried forward to ${result.nextOperatingDate} with fresh #01 token numbering.`,
      result
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
