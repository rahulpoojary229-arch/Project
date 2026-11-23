import { Router } from 'express';
import { AiAssistantService } from '../services/aiAssistantService.js';

export const assistantRouter = Router();
const assistantService = new AiAssistantService();

// POST /api/assistant/ask - Ask LabLink question
assistantRouter.post('/ask', (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ success: false, error: 'Question is required.' });
  }

  const response = assistantService.ask(question);
  res.json({ success: true, response });
});
