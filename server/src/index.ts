import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { labsRouter } from './routes/labs.js';
import { studentsRouter } from './routes/students.js';
import { queueRouter } from './routes/queue.js';
import { attendantRouter } from './routes/attendant.js';
import { assistantRouter } from './routes/assistant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/labs', labsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/queue', queueRouter);
app.use('/api/attendant', attendantRouter);
app.use('/api/assistant', assistantRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'LabLink API Server',
    version: '1.0.0',
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
  console.log(`  LabLink Server running at: http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Default Timezone: Asia/Kolkata`);
  console.log(`=======================================================`);
});

export { app, server };
