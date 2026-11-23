import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('---------------------------------------------------------');
console.log(' Starting LabLink Services (Backend + Frontend Client)...');
console.log('---------------------------------------------------------');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Server on port 3001
const server = spawn(npmCmd, ['run', 'dev:server'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite Client on port 5173
const client = spawn(npmCmd, ['run', 'dev:client'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\nShutting down LabLink...');
  server.kill();
  client.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
