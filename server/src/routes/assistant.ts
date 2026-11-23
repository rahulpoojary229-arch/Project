import { Router } from 'express';
import { AiAssistantService } from '../services/aiAssistantService.js';
import { aiAssistantLimiter, sanitizeString } from '../middleware/security.js';

export const assistantRouter = Router();
const assistantService = new AiAssistantService();

// POST /api/assistant/ask - Ask LabLink question (Rate Limited & Sanitized)
assistantRouter.post('/ask', aiAssistantLimiter, (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ success: false, error: 'Question is required.' });
  }

  const cleanQuestion = sanitizeString(question);
  if (cleanQuestion.length > 300) {
    return res.status(400).json({ success: false, error: 'Question cannot exceed 300 characters.' });
  }

  const response = assistantService.ask(cleanQuestion);
  res.json({ success: true, response });
});
