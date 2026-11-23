import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { QueueEngine, TEN_MINUTES_MS } from '../src/services/queueEngine.js';
import { StorageService } from '../src/services/storage.js';

describe('LabLink Smart Queue & Token Engine - Core Requirements', () => {
  const queueEngine = QueueEngine.getInstance();
  const storage = StorageService.getInstance();

  beforeEach(async () => {
    // Clear storage tokens between tests for clean isolation
    await storage.clearAllTokensForTesting();
  });

  // Requirement 1: First-come, first-served ordering
  it('1. FCFS Ordering: Earlier submission timestamps strictly receive priority', async () => {
    const monday = '2026-11-23'; // Monday
    
    // First request
    const res1 = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Testing ARM MCU circuit',
      requestedDurationMinutes: 60,
      requestDate: monday
    });
    assert.equal(res1.success, true);
    assert.equal(res1.token?.tokenNumber, '#01');

    // Simulate time gap
    await new Promise(r => setTimeout(r, 10));

    // Second request
    const res2 = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2022-ME01',
      labId: 'lab-elec',
      purpose: 'PCB Soldering',
      requestedDurationMinutes: 30, // shorter duration, but arrived later
      requestDate: monday
    });
    assert.equal(res2.success, true);
    assert.equal(res2.token?.tokenNumber, '#02');

    const queue = queueEngine.getActiveQueue('lab-elec', monday);
    assert.equal(queue.length, 2);
    assert.equal(queue[0].id, res1.token!.id, 'First applicant must be at position 1');
    assert.equal(queue[1].id, res2.token!.id, 'Second applicant must be at position 2');
  });

  // Requirement 2: Independent queues for different laboratories
  it('2. Independent Queues: Different laboratories maintain completely separate queues and sequences', async () => {
    const date = '2026-11-23';
    
    // Token in Electronics Lab
    const elecRes = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'FPGA programming',
      requestedDurationMinutes: 45,
      requestDate: date
    });
    assert.equal(elecRes.token?.tokenNumber, '#01');

    // Token in Mechanical 3D Printing Lab
    const mechRes = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2022-ME01',
      labId: 'lab-mech',
      purpose: 'Ultimaker 3D printing chassis',
      requestedDurationMinutes: 60,
      requestDate: date
    });
    assert.equal(mechRes.token?.tokenNumber, '#01', 'Mech lab token sequence must independently start at #01');

    const elecQueue = queueEngine.getActiveQueue('lab-elec', date);
    const mechQueue = queueEngine.getActiveQueue('lab-mech', date);

    assert.equal(elecQueue.length, 1);
    assert.equal(mechQueue.length, 1);
    assert.notEqual(elecQueue[0].labId, mechQueue[0].labId);
  });

  // Requirement 3: Token numbering starts at #01
  it('3. Token numbering starts at #01 for any new queue day', async () => {
    const res = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-CS42',
      labId: 'lab-cs',
      purpose: 'PyTorch Model Training',
      requestedDurationMinutes: 60,
      requestDate: '2026-11-24'
    });
    assert.equal(res.success, true);
    assert.equal(res.token?.tokenNumber, '#01');
    assert.equal(res.token?.numericSequence, 1);
  });

  // Requirement 4 & 5: Daily token reset and Carryover priority
  it('4 & 5. Daily token reset and Carryover priority: Unserved Monday tokens become #01 on Tuesday ahead of all', async () => {
    const monday = '2026-11-23';
    const tuesday = '2026-11-24';

    // Monday Token #01 (will be served)
    const t1 = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Lab session 1',
      requestedDurationMinutes: 30,
      requestDate: monday
    });
    // Mark t1 served
    await queueEngine.callStudent(t1.token!.id);
    await queueEngine.confirmArrival(t1.token!.id);
    await queueEngine.startSession(t1.token!.id);
    await queueEngine.endSession(t1.token!.id);

    // Monday Token #02 (remains unserved / Waiting due to lab closure)
    const t2 = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2022-ME01',
      labId: 'lab-elec',
      purpose: 'Lab session 2 unserved',
      requestedDurationMinutes: 45,
      requestDate: monday
    });
    assert.equal(t2.token?.tokenNumber, '#02');

    // Trigger Day Closure on Monday
    const closureResult = await queueEngine.closeOperatingDay('lab-elec', monday);
    assert.equal(closureResult.carriedOverCount, 1);
    assert.equal(closureResult.newTokens[0].tokenNumber, '#01', 'Carried over token resets sequence to #01 on Tuesday');
    assert.equal(closureResult.newTokens[0].isCarryover, true);
    assert.equal(closureResult.newTokens[0].originalTokenNumber, '#02');
  });

  // Requirement 6: New requests appear after carryovers
  it('6. Priority check: New requests on Tuesday appear strictly behind carryover tokens', async () => {
    const monday = '2026-11-23';
    const tuesday = '2026-11-24';

    // Monday unserved request
    await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Monday backlog',
      requestedDurationMinutes: 60,
      requestDate: monday
    });

    // Close Monday -> carries over to Tuesday as #01
    await queueEngine.closeOperatingDay('lab-elec', monday);

    // Tuesday new request
    const newReq = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2022-ME01',
      labId: 'lab-elec',
      purpose: 'Fresh Tuesday request',
      requestedDurationMinutes: 20,
      requestDate: tuesday
    });
    assert.equal(newReq.token?.tokenNumber, '#02', 'New Tuesday applicant receives #02');

    const tuesdayQueue = queueEngine.getActiveQueue('lab-elec', tuesday);
    assert.equal(tuesdayQueue.length, 2);
    assert.equal(tuesdayQueue[0].isCarryover, true, 'Position 1 must be the carryover student');
    assert.equal(tuesdayQueue[1].isCarryover, false, 'Position 2 must be the new student');
  });

  // Requirement 7: Cancelled requests do not carry forward
  it('7. Cancelled requests do not carry forward upon day closure', async () => {
    const monday = '2026-11-23';

    const req = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Will cancel this',
      requestedDurationMinutes: 30,
      requestDate: monday
    });

    // Student cancels request
    await queueEngine.cancelToken(req.token!.id, 'Student plans changed');

    // Trigger close of day
    const closure = await queueEngine.closeOperatingDay('lab-elec', monday);
    assert.equal(closure.carriedOverCount, 0, 'Cancelled token must NOT carry forward');
  });

  // Requirement 8: No-show tokens expire after 10 minutes
  it('8. Ten-minute rule: Tokens in "Your turn" auto-expire when 10 minutes elapse without arrival', async () => {
    const req = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'No show test',
      requestedDurationMinutes: 30,
      requestDate: '2026-11-23'
    });

    // Attendant calls student
    const callRes = await queueEngine.callStudent(req.token!.id);
    assert.equal(callRes.token?.status, 'Your turn');
    assert.ok(callRes.token?.callExpiryTimestamp);

    // Simulate 9 minutes elapsed: should NOT be expired yet
    const simulated9Mins = callRes.token!.callTimestamp! + (9 * 60 * 1000);
    queueEngine.checkAndExpireNoShows(simulated9Mins);
    let currentToken = storage.getTokenById(req.token!.id);
    assert.equal(currentToken?.status, 'Your turn', 'Should remain "Your turn" before 10 minutes');

    // Simulate 10 minutes and 1 second elapsed: must be expired!
    const simulated10Mins1Sec = callRes.token!.callTimestamp! + TEN_MINUTES_MS + 1000;
    queueEngine.checkAndExpireNoShows(simulated10Mins1Sec);
    currentToken = storage.getTokenById(req.token!.id);
    assert.equal(currentToken?.status, 'Expired', 'Token must auto-expire after 10 minutes');
  });

  // Requirement 9: Refreshing page does not reset expiry countdown
  it('9. Server-backed timer: Refreshing/re-querying derives countdown from immutable server timestamp', async () => {
    const req = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Refresh persistence test',
      requestedDurationMinutes: 30,
      requestDate: '2026-11-23'
    });

    const called = await queueEngine.callStudent(req.token!.id);
    const initialExpiry = called.token!.callExpiryTimestamp;

    // Simulate client browser refresh after 3 minutes: fetch standing again
    const refreshedStanding = queueEngine.getQueueStanding(req.token!.id);
    assert.equal(refreshedStanding?.token.callExpiryTimestamp, initialExpiry, 'Expiry timestamp must remain identical across queries');
  });

  // Requirement 10: Duration limits enforced
  it('10. Duration validation: Cannot exceed laboratory configured limits', async () => {
    // lab-elec max duration is 120 minutes
    const excessDurationReq = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Overly long session',
      requestedDurationMinutes: 240, // 4 hours requested
      requestDate: '2026-11-23'
    });
    assert.equal(excessDurationReq.success, false);
    assert.match(excessDurationReq.error || '', /exceeds the maximum permitted session/i);

    // Cannot be below min (15 mins)
    const tooShortReq = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Too short',
      requestedDurationMinutes: 5,
      requestDate: '2026-11-23'
    });
    assert.equal(tooShortReq.success, false);
    assert.match(tooShortReq.error || '', /less than the minimum permitted session/i);
  });

  // Requirement 11: Operating schedule enforced
  it('11. Operating days validation: Cannot book on closed days', async () => {
    // lab-elec is closed on Sunday
    const sundayDate = '2026-11-29'; // Sunday
    const closedDayReq = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Sunday access',
      requestedDurationMinutes: 45,
      requestDate: sundayDate
    });
    assert.equal(closedDayReq.success, false);
    assert.match(closedDayReq.error || '', /closed on Sundays/i);
  });

  // Requirement 12: Attendant actions update queue status
  it('12. Attendant lifecycle: Status transitions accurately from Waiting -> Your turn -> Arrived -> In use -> Completed', async () => {
    const req = await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec',
      purpose: 'Full lifecycle test',
      requestedDurationMinutes: 30,
      requestDate: '2026-11-23'
    });
    const id = req.token!.id;

    // 1. Initial
    assert.equal(storage.getTokenById(id)?.status, 'Waiting');

    // 2. Attendant Calls
    await queueEngine.callStudent(id);
    assert.equal(storage.getTokenById(id)?.status, 'Your turn');

    // 3. Student Arrives
    await queueEngine.confirmArrival(id);
    assert.equal(storage.getTokenById(id)?.status, 'Arrived');

    // 4. Session Starts
    await queueEngine.startSession(id);
    assert.equal(storage.getTokenById(id)?.status, 'In use');
    assert.ok(storage.getTokenById(id)?.sessionStartTime);

    // 5. Session Ends
    await queueEngine.endSession(id);
    assert.equal(storage.getTokenById(id)?.status, 'Completed');
    assert.ok(storage.getTokenById(id)?.sessionActualEndTime);
  });

  // Requirement 13: Closed-day carryover calculates next actual operating day
  it('13. Weekend / holiday jump: Friday closure correctly targets Monday as next operating day', async () => {
    const friday = '2026-11-27'; // Friday
    
    await queueEngine.submitAccessRequest({
      registrationNumber: 'REG-2023-EC14',
      labId: 'lab-elec', // open Mon-Fri, closed Sat & Sun
      purpose: 'Friday unserved research',
      requestedDurationMinutes: 45,
      requestDate: friday
    });

    const closure = await queueEngine.closeOperatingDay('lab-elec', friday);
    assert.equal(closure.carriedOverCount, 1);
    assert.equal(closure.nextOperatingDate, '2026-11-30', 'Next operating day after Friday must be Monday 2026-11-30');
    assert.equal(closure.newTokens[0].requestDate, '2026-11-30');
    assert.equal(closure.newTokens[0].tokenNumber, '#01');
  });
});
