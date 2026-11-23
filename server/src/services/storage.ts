import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Laboratory, QueueToken, StudentRecord } from '../types.js';
import { SAMPLE_LABORATORIES } from '../data/sampleLabs.js';
import { SAMPLE_STUDENTS } from '../data/sampleStudents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNTIME_DIR = path.resolve(__dirname, '../../runtime-data');
const DATA_FILE = path.join(RUNTIME_DIR, 'queues.json');

interface PersistedData {
  version: string;
  lastUpdated: number;
  currentDate: string; // YYYY-MM-DD
  tokens: QueueToken[];
}

export class StorageService {
  private static instance: StorageService;
  private tokens: Map<string, QueueToken> = new Map();
  private labs: Map<string, Laboratory> = new Map();
  private students: Map<string, StudentRecord> = new Map();
  private writeLock: Promise<void> = Promise.resolve();
  private currentDate: string;

  private constructor() {
    this.currentDate = this.getTodayDateString();
    this.initializeData();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getTodayDateString(): string {
    // Returns YYYY-MM-DD based on Asia/Kolkata or system local
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private initializeData(): void {
    // 1. Load sample laboratories
    SAMPLE_LABORATORIES.forEach(lab => {
      this.labs.set(lab.id, JSON.parse(JSON.stringify(lab)));
    });

    // 2. Load sample students
    SAMPLE_STUDENTS.forEach(student => {
      this.students.set(student.registrationNumber.toUpperCase(), JSON.parse(JSON.stringify(student)));
    });

    // 3. Ensure runtime directory exists
    if (!fs.existsSync(RUNTIME_DIR)) {
      try {
        fs.mkdirSync(RUNTIME_DIR, { recursive: true });
      } catch (err) {
        console.error('[StorageService] Error creating runtime dir:', err);
      }
    }

    // 4. Load persisted tokens if available
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data: PersistedData = JSON.parse(raw);
        if (data.currentDate) {
          this.currentDate = data.currentDate;
        }
        if (Array.isArray(data.tokens)) {
          data.tokens.forEach(token => {
            this.tokens.set(token.id, token);
          });
        }
        console.log(`[StorageService] Restored ${this.tokens.size} tokens from persistent storage.`);
      } catch (err) {
        console.error('[StorageService] Failed to read persistent queue data, starting fresh:', err);
      }
    } else {
      this.persistSynchronously();
    }
  }

  private async persist(): Promise<void> {
    this.writeLock = this.writeLock.then(async () => {
      try {
        const payload: PersistedData = {
          version: '1.0.0',
          lastUpdated: Date.now(),
          currentDate: this.currentDate,
          tokens: Array.from(this.tokens.values())
        };
        const tempPath = `${DATA_FILE}.tmp`;
        await fs.promises.writeFile(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
        await fs.promises.rename(tempPath, DATA_FILE);
      } catch (err) {
        console.error('[StorageService] Error writing queue state:', err);
      }
    });
    return this.writeLock;
  }

  private persistSynchronously(): void {
    try {
      const payload: PersistedData = {
        version: '1.0.0',
        lastUpdated: Date.now(),
        currentDate: this.currentDate,
        tokens: Array.from(this.tokens.values())
      };
      if (!fs.existsSync(RUNTIME_DIR)) {
        fs.mkdirSync(RUNTIME_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[StorageService] Error synchronous write:', err);
    }
  }

  // --- Laboratory queries ---
  public getAllLabs(): Laboratory[] {
    return Array.from(this.labs.values());
  }

  public getLabById(id: string): Laboratory | undefined {
    return this.labs.get(id);
  }

  // --- Student queries ---
  public getStudentByRegistration(regNo: string): StudentRecord | undefined {
    return this.students.get(regNo.trim().toUpperCase());
  }

  public getAllDemoStudents(): StudentRecord[] {
    return Array.from(this.students.values());
  }

  // --- Queue Date Management ---
  public getCurrentDate(): string {
    return this.currentDate;
  }

  public setCurrentDate(newDate: string): void {
    this.currentDate = newDate;
    this.persist();
  }

  // --- Token operations ---
  public getAllTokens(): QueueToken[] {
    return Array.from(this.tokens.values());
  }

  public getTokensForLab(labId: string, date?: string): QueueToken[] {
    const targetDate = date || this.currentDate;
    return Array.from(this.tokens.values())
      .filter(t => t.labId === labId && t.requestDate === targetDate);
  }

  public getTokenById(tokenId: string): QueueToken | undefined {
    return this.tokens.get(tokenId);
  }

  public async saveToken(token: QueueToken): Promise<QueueToken> {
    this.tokens.set(token.id, token);
    await this.persist();
    return token;
  }

  public async updateToken(tokenId: string, updater: (token: QueueToken) => void): Promise<QueueToken | null> {
    const token = this.tokens.get(tokenId);
    if (!token) return null;
    updater(token);
    await this.persist();
    return token;
  }

  public async clearAllTokensForTesting(): Promise<void> {
    this.tokens.clear();
    this.currentDate = this.getTodayDateString();
    await this.persist();
  }
}
