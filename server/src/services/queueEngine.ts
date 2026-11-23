import crypto from 'node:crypto';
import { QueueToken, TokenStatus, Laboratory, DayOfWeek } from '../types.js';
import { StorageService } from './storage.js';
import { VerificationService } from './verificationService.js';

export const TEN_MINUTES_MS = 10 * 60 * 1000;

export class QueueEngine {
  private static instance: QueueEngine;
  private storage: StorageService;
  private verificationService: VerificationService;

  private constructor() {
    this.storage = StorageService.getInstance();
    this.verificationService = new VerificationService();
    // Run an automated sweep for any expired no-show tokens every 15 seconds
    setInterval(() => {
      this.checkAndExpireNoShows();
    }, 15000).unref(); // unref so it does not block Node process exit in tests
  }

  public static getInstance(): QueueEngine {
    if (!QueueEngine.instance) {
      QueueEngine.instance = new QueueEngine();
    }
    return QueueEngine.instance;
  }

  /**
   * Helper to format token number with leading zero e.g. 1 -> "#01", 12 -> "#12"
   */
  public formatTokenNumber(seq: number): string {
    return `#${String(seq).padStart(2, '0')}`;
  }

  /**
   * Generates a sanitized internal student reference instead of storing raw registration number openly.
   */
  public generateStudentRef(regNo: string): string {
    const hash = crypto.createHash('sha256').update(regNo).digest('hex').substring(0, 6).toUpperCase();
    return `STU-${hash}`;
  }

  /**
   * Evaluates all tokens in "Your turn" state and auto-expires them if 10 minutes have elapsed without arrival.
   * Uses server timestamps as single source of truth.
   */
  public checkAndExpireNoShows(currentTimeMs: number = Date.now()): QueueToken[] {
    const expiredTokens: QueueToken[] = [];
    const allTokens = this.storage.getAllTokens();

    for (const token of allTokens) {
      if (token.status === 'Your turn' && token.callExpiryTimestamp) {
        if (currentTimeMs >= token.callExpiryTimestamp) {
          token.status = 'Expired';
          token.notes = `Auto-expired: Student failed to arrive within 10-minute window (Called at ${new Date(token.callTimestamp!).toISOString()})`;
          this.storage.saveToken(token);
          expiredTokens.push(token);
        }
      }
    }

    return expiredTokens;
  }

  /**
   * Requests laboratory access and joins the smart FCFS queue.
   */
  public async submitAccessRequest(params: {
    registrationNumber: string;
    labId: string;
    purpose: string;
    requestedDurationMinutes: number;
    requestDate?: string;
  }): Promise<{ success: boolean; token?: QueueToken; error?: string; reasons?: string[] }> {
    const { registrationNumber, labId, purpose, requestedDurationMinutes } = params;
    const targetDate = params.requestDate || this.storage.getCurrentDate();

    const lab = this.storage.getLabById(labId);
    if (!lab) {
      return { success: false, error: 'Laboratory not found.' };
    }

    // 1. Verify eligibility
    const eligibilityCheck = this.verificationService.verifyEligibility(registrationNumber, labId);
    if (!eligibilityCheck.eligible) {
      return {
        success: false,
        error: 'Eligibility verification failed. You do not meet the configured criteria for this laboratory.',
        reasons: eligibilityCheck.reasons
      };
    }

    // 2. Validate duration limits
    const durationCheck = this.verificationService.validateDuration(lab, requestedDurationMinutes);
    if (!durationCheck.valid) {
      return {
        success: false,
        error: durationCheck.reason || 'Invalid duration requested.'
      };
    }

    // 3. Verify operating days
    const operatingCheck = this.verificationService.isLabOperatingOnDate(lab, targetDate);
    if (!operatingCheck.operating) {
      return {
        success: false,
        error: operatingCheck.reason || 'Laboratory is not open on the selected date.'
      };
    }

    // 4. Check active tokens for this student in this lab for today
    const existingTokens = this.storage.getTokensForLab(labId, targetDate);
    const existingActive = existingTokens.find(
      t => t.registrationNumber.toUpperCase() === registrationNumber.toUpperCase() &&
           ['Waiting', 'Your turn', 'Arrived', 'In use'].includes(t.status)
    );
    if (existingActive) {
      return {
        success: false,
        error: `You already hold active Token ${existingActive.tokenNumber} for ${lab.name} today. Cannot hold duplicate active tokens.`
      };
    }

    // 5. Check daily capacity
    const validCount = existingTokens.filter(t => t.status !== 'Cancelled').length;
    if (validCount >= lab.operatingSchedule.dailyStudentCapacity) {
      return {
        success: false,
        error: `Daily student capacity (${lab.operatingSchedule.dailyStudentCapacity}) reached for ${lab.name} on ${targetDate}. New requests can be scheduled for the next operating day.`
      };
    }

    // 6. Calculate next numeric sequence for this laboratory today
    const currentMaxSeq = existingTokens.reduce((max, t) => Math.max(max, t.numericSequence || 0), 0);
    const nextSeq = currentMaxSeq + 1;
    const tokenNumber = this.formatTokenNumber(nextSeq);

    const now = Date.now();
    const newToken: QueueToken = {
      id: crypto.randomUUID(),
      labId,
      tokenNumber,
      numericSequence: nextSeq,
      registrationNumber: registrationNumber.toUpperCase(),
      studentRef: this.generateStudentRef(registrationNumber),
      studentName: eligibilityCheck.student?.name || 'Student',
      purpose: purpose.trim(),
      requestedDurationMinutes,
      requestDate: targetDate,
      submittedTimestamp: now,
      status: 'Waiting',
      callTimestamp: null,
      callExpiryTimestamp: null,
      sessionStartTime: null,
      sessionIntendedEndTime: null,
      sessionActualEndTime: null,
      actualDurationMinutes: null,
      isCarryover: false,
      originalTokenNumber: null
    };

    await this.storage.saveToken(newToken);
    return { success: true, token: newToken };
  }

  /**
   * Retrieves ordered active queue for a specific laboratory.
   * Strict FCFS: carryovers first (with their preserved original timestamps), followed by regular tokens.
   */
  public getActiveQueue(labId: string, date?: string): QueueToken[] {
    this.checkAndExpireNoShows(); // ensure expiry is current
    const tokens = this.storage.getTokensForLab(labId, date);

    return tokens
      .filter(t => ['Waiting', 'Your turn', 'Arrived', 'In use'].includes(t.status))
      .sort((a, b) => {
        // Carryovers get strict precedence; within each group, order by original submittedTimestamp
        if (a.isCarryover && !b.isCarryover) return -1;
        if (!a.isCarryover && b.isCarryover) return 1;
        return a.submittedTimestamp - b.submittedTimestamp;
      });
  }

  /**
   * Computes the current student's queue standing:
   * - Token number
   * - Current position
   * - Students ahead
   * - Estimated waiting time
   */
  public getQueueStanding(tokenId: string): {
    token: QueueToken;
    position: number;
    studentsAhead: number;
    estimatedWaitMinutes: number;
    activeQueueLength: number;
  } | null {
    this.checkAndExpireNoShows();
    const token = this.storage.getTokenById(tokenId);
    if (!token) return null;

    const activeQueue = this.getActiveQueue(token.labId, token.requestDate);
    const index = activeQueue.findIndex(t => t.id === token.id);

    if (index === -1) {
      // Not in active waiting queue (e.g., Completed, Expired, Cancelled)
      return {
        token,
        position: 0,
        studentsAhead: 0,
        estimatedWaitMinutes: 0,
        activeQueueLength: activeQueue.length
      };
    }

    const studentsAhead = index;
    // Estimate: sum of requested durations of all students ahead, or average 30 mins
    let estimatedWaitMinutes = 0;
    for (let i = 0; i < index; i++) {
      estimatedWaitMinutes += (activeQueue[i].requestedDurationMinutes || 30);
    }

    return {
      token,
      position: index + 1,
      studentsAhead,
      estimatedWaitMinutes,
      activeQueueLength: activeQueue.length
    };
  }

  /**
   * Attendant Action: Call the next student.
   * Begins the 10-minute countdown with server-side timestamps.
   */
  public async callStudent(tokenId: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    this.checkAndExpireNoShows();
    const token = this.storage.getTokenById(tokenId);
    if (!token) return { success: false, error: 'Token not found.' };

    if (token.status !== 'Waiting') {
      return { success: false, error: `Cannot call student with status "${token.status}". Must be "Waiting".` };
    }

    const now = Date.now();
    token.status = 'Your turn';
    token.callTimestamp = now;
    token.callExpiryTimestamp = now + TEN_MINUTES_MS;

    await this.storage.saveToken(token);
    return { success: true, token };
  }

  /**
   * Attendant Action: Confirm student arrival within the 10-minute window.
   */
  public async confirmArrival(tokenId: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const token = this.storage.getTokenById(tokenId);
    if (!token) return { success: false, error: 'Token not found.' };

    // Check if already expired
    if (token.callExpiryTimestamp && Date.now() > token.callExpiryTimestamp && token.status !== 'Arrived') {
      token.status = 'Expired';
      await this.storage.saveToken(token);
      return { success: false, error: '10-minute window has elapsed. Token has expired.' };
    }

    if (token.status !== 'Your turn') {
      return { success: false, error: `Cannot confirm arrival for status "${token.status}". Must be "Your turn".` };
    }

    token.status = 'Arrived';
    await this.storage.saveToken(token);
    return { success: true, token };
  }

  /**
   * Attendant Action: Start laboratory session.
   */
  public async startSession(tokenId: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const token = this.storage.getTokenById(tokenId);
    if (!token) return { success: false, error: 'Token not found.' };

    if (token.status !== 'Arrived') {
      return { success: false, error: `Cannot start session. Student must first be marked as "Arrived".` };
    }

    const now = Date.now();
    token.status = 'In use';
    token.sessionStartTime = now;
    token.sessionIntendedEndTime = now + (token.requestedDurationMinutes * 60 * 1000);

    await this.storage.saveToken(token);
    return { success: true, token };
  }

  /**
   * Attendant Action: End laboratory session.
   */
  public async endSession(tokenId: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const token = this.storage.getTokenById(tokenId);
    if (!token) return { success: false, error: 'Token not found.' };

    if (token.status !== 'In use') {
      return { success: false, error: `Cannot end session for token with status "${token.status}". Must be "In use".` };
    }

    const now = Date.now();
    token.status = 'Completed';
    token.sessionActualEndTime = now;
    if (token.sessionStartTime) {
      token.actualDurationMinutes = Math.round((now - token.sessionStartTime) / (60 * 1000));
    }

    await this.storage.saveToken(token);
    return { success: true, token };
  }

  /**
   * Attendant Override: Force expire no-show token.
   */
  public async expireToken(tokenId: string, reason?: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const token = this.storage.getTokenById(tokenId);
    if (!token) return { success: false, error: 'Token not found.' };

    token.status = 'Expired';
    token.notes = reason || 'Manually marked as expired by attendant override.';
    await this.storage.saveToken(token);
    return { success: true, token };
  }

  /**
   * Cancellation: Student or Attendant cancels request.
   */
  public async cancelToken(tokenId: string, reason?: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const token = this.storage.getTokenById(tokenId);
    if (!token) return { success: false, error: 'Token not found.' };

    if (['Completed', 'Expired', 'Cancelled'].includes(token.status)) {
      return { success: false, error: `Token is already in final state: "${token.status}".` };
    }

    token.status = 'Cancelled';
    token.cancellationReason = reason || 'Cancelled by user.';
    await this.storage.saveToken(token);
    return { success: true, token };
  }

  /**
   * Helper: Calculates the next operating day for a laboratory.
   * Skips closed days (e.g. weekends if closed).
   */
  public getNextOperatingDate(lab: Laboratory, fromDateStr: string): string {
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const current = new Date(fromDateStr);

    for (let i = 1; i <= 7; i++) {
      current.setDate(current.getDate() + 1);
      const nextDayName = dayNames[current.getDay()];
      if (lab.operatingSchedule.operatingDays.includes(nextDayName)) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    // Default fallback to next calendar day
    const fallback = new Date(fromDateStr);
    fallback.setDate(fallback.getDate() + 1);
    return fallback.toISOString().split('T')[0];
  }

  /**
   * Closes the operating day for a laboratory and executes carryover logic.
   * EXACT BEHAVIOUR REQUIREMENT (Rule 5.B):
   * 1. Only unserved requests ('Waiting') caused by laboratory closure carry forward.
   * 2. Preserve their original request timestamps and queue priority.
   * 3. Carryover requests must be placed before new requests.
   * 4. Generate completely new daily token numbers beginning with #01.
   * 5. Each laboratory maintains its own token sequence.
   * 6. Cancelled and expired/no-show requests must NOT carry forward.
   * 7. Students already served ('Completed') must NOT appear in the next day's queue.
   * 8. Use the next actual operating day if closed on weekends/holidays.
   */
  public async closeOperatingDay(labId: string, currentDateStr?: string): Promise<{
    carriedOverCount: number;
    nextOperatingDate: string;
    newTokens: QueueToken[];
  }> {
    const lab = this.storage.getLabById(labId);
    if (!lab) {
      throw new Error(`Laboratory ${labId} not found.`);
    }

    const currentDay = currentDateStr || this.storage.getCurrentDate();
    const nextOperatingDay = this.getNextOperatingDate(lab, currentDay);

    // 1. Fetch all tokens for this lab on the closing day
    const dayTokens = this.storage.getTokensForLab(labId, currentDay);

    // 2. Filter ONLY unserved requests in 'Waiting' state (unserved due to closure)
    // Cancelled, Expired, Arrived/In use/Completed are NOT carried over as unserved
    const unservedTokens = dayTokens
      .filter(t => t.status === 'Waiting')
      .sort((a, b) => a.submittedTimestamp - b.submittedTimestamp);

    const newTokens: QueueToken[] = [];
    let nextSeq = 1;

    for (const oldToken of unservedTokens) {
      const newTokenNumber = this.formatTokenNumber(nextSeq);
      const carriedToken: QueueToken = {
        id: crypto.randomUUID(),
        labId,
        tokenNumber: newTokenNumber,
        numericSequence: nextSeq,
        registrationNumber: oldToken.registrationNumber,
        studentRef: oldToken.studentRef,
        studentName: oldToken.studentName,
        purpose: oldToken.purpose,
        requestedDurationMinutes: oldToken.requestedDurationMinutes,
        requestDate: nextOperatingDay,
        submittedTimestamp: oldToken.submittedTimestamp, // PRESERVE original timestamp!
        status: 'Waiting',
        callTimestamp: null,
        callExpiryTimestamp: null,
        sessionStartTime: null,
        sessionIntendedEndTime: null,
        sessionActualEndTime: null,
        actualDurationMinutes: null,
        isCarryover: true,
        originalTokenNumber: oldToken.tokenNumber // Record e.g. #04 from yesterday
      };

      // Mark the old token as closed/carried over
      oldToken.notes = `Carried forward to ${nextOperatingDay} as Token ${newTokenNumber}`;
      await this.storage.saveToken(oldToken);

      await this.storage.saveToken(carriedToken);
      newTokens.push(carriedToken);
      nextSeq++;
    }

    return {
      carriedOverCount: newTokens.length,
      nextOperatingDate: nextOperatingDay,
      newTokens
    };
  }
}
