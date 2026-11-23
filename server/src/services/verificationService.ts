import { Laboratory, StudentRecord, VerificationResult, DayOfWeek } from '../types.js';
import { StorageService } from './storage.js';

export class VerificationService {
  private storage: StorageService;

  constructor() {
    this.storage = StorageService.getInstance();
  }

  /**
   * Evaluates student eligibility for a specific laboratory.
   * Does NOT invent information; strictly compares against configured lab rules.
   */
  public verifyEligibility(regNo: string, labId: string): VerificationResult {
    const lab = this.storage.getLabById(labId);
    if (!lab) {
      return {
        eligible: false,
        reasons: ['The selected laboratory was not found in the system configuration.']
      };
    }

    const student = this.storage.getStudentByRegistration(regNo);
    if (!student) {
      return {
        eligible: false,
        reasons: [
          `Registration number "${regNo}" was not found in the college demo records.`,
          'Please verify your registration number on your College ID card, Student Portal, or Fee Receipt.',
          'Demo accounts available: REG-2022-ME01, REG-2023-EC14, REG-2023-CS42, REG-2024-ME08, REG-2025-CS99.'
        ]
      };
    }

    const failureReasons: string[] = [];

    // 1. Check Academic Year
    if (!lab.eligibility.eligibleAcademicYears.includes(student.academicYear)) {
      failureReasons.push(
        `Academic Year requirement not met. ${lab.name} requires students in Year(s): [${lab.eligibility.eligibleAcademicYears.join(', ')}]. You are currently registered in Year ${student.academicYear}.`
      );
    }

    // 2. Check Department
    const studentDeptNorm = student.department.toUpperCase();
    const deptMatch = lab.eligibility.eligibleDepartments.some(d => 
      d.toUpperCase() === studentDeptNorm || studentDeptNorm.includes(d.toUpperCase()) || d.toUpperCase().includes(studentDeptNorm)
    );
    if (!deptMatch) {
      failureReasons.push(
        `Department requirement not met. ${lab.name} is configured for [${lab.eligibility.eligibleDepartments.join(', ')}]. Your registered department is ${student.department}.`
      );
    }

    // 3. Check Safety Trainings
    const missingTrainings = lab.eligibility.requiredSafetyTraining.filter(
      training => !student.completedSafetyTrainings.includes(training)
    );
    if (missingTrainings.length > 0) {
      failureReasons.push(
        `Mandatory safety training incomplete. Missing: ${missingTrainings.map(t => `"${t}"`).join(', ')}. Complete these modules via the Campus Safety Portal before requesting access.`
      );
    }

    // 4. Check Prior Permission (if needed before joining queue)
    if (lab.permissions.hodApprovalNeeded && lab.permissions.permissionTiming === 'Before joining queue') {
      const hasApproval = student.hodApprovals && student.hodApprovals.includes(labId);
      if (!hasApproval) {
        failureReasons.push(
          `Prior Head of Department (HOD) approval is required before joining the queue for this high-risk laboratory. Procedure: ${lab.permissions.procedure}`
        );
      }
    }

    // If there are failures, gather alternative laboratory recommendations
    let alternativeLabs: { id: string; name: string }[] | undefined = undefined;
    if (failureReasons.length > 0 && lab.eligibility.alternativeLabSuggestions) {
      alternativeLabs = lab.eligibility.alternativeLabSuggestions
        .map(altId => {
          const altLab = this.storage.getLabById(altId);
          return altLab ? { id: altLab.id, name: altLab.name } : null;
        })
        .filter((l): l is { id: string; name: string } => l !== null);
    }

    return {
      eligible: failureReasons.length === 0,
      reasons: failureReasons,
      alternativeLabs,
      student: {
        registrationNumber: student.registrationNumber,
        name: student.name,
        department: student.department,
        academicYear: student.academicYear
      }
    };
  }

  /**
   * Validates requested session duration against laboratory limits.
   */
  public validateDuration(lab: Laboratory, durationMinutes: number): { valid: boolean; reason?: string } {
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      return { valid: false, reason: 'Requested duration must be a positive number of minutes.' };
    }
    if (durationMinutes < lab.operatingSchedule.minDurationMinutes) {
      return {
        valid: false,
        reason: `Requested duration (${durationMinutes} mins) is less than the minimum permitted session of ${lab.operatingSchedule.minDurationMinutes} minutes for ${lab.name}.`
      };
    }
    if (durationMinutes > lab.operatingSchedule.maxDurationMinutes) {
      return {
        valid: false,
        reason: `Requested duration (${durationMinutes} mins) exceeds the maximum permitted session of ${lab.operatingSchedule.maxDurationMinutes} minutes for ${lab.name}.`
      };
    }
    return { valid: true };
  }

  /**
   * Checks whether the laboratory operates on a given date.
   */
  public isLabOperatingOnDate(lab: Laboratory, dateStr: string): { operating: boolean; dayName: DayOfWeek; reason?: string } {
    const dateObj = new Date(dateStr);
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dateObj.getDay()];

    const operating = lab.operatingSchedule.operatingDays.includes(dayName);
    if (!operating) {
      return {
        operating: false,
        dayName,
        reason: `${lab.name} is closed on ${dayName}s. Operating days are: ${lab.operatingSchedule.operatingDays.join(', ')}.`
      };
    }
    return { operating: true, dayName };
  }
}
