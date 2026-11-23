export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type TokenStatus = 
  | 'Waiting' 
  | 'Your turn' 
  | 'Arrived' 
  | 'In use' 
  | 'Completed' 
  | 'Expired' 
  | 'Cancelled';

export interface OperatingSchedule {
  operatingDays: DayOfWeek[];
  openingTime: string;
  closingTime: string;
  dailyStudentCapacity: number;
  dailyUsageMinutesCapacity: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  allowExtensions: boolean;
}

export interface EligibilityRules {
  eligibleAcademicYears: number[];
  eligibleDepartments: string[];
  prerequisiteSubjects: string[];
  requiredSafetyTraining: string[];
  alternativeLabSuggestions?: string[];
}

export interface PermissionRules {
  approvalRequiredFrom: 'Lab In-Charge' | 'Head of Department (HOD)' | 'None';
  hodApprovalNeeded: boolean;
  permissionTiming: 'Before joining queue' | 'Before entering laboratory';
  procedure: string;
}

export interface StaffContact {
  labInChargeName: string;
  contactNumber: string;
  email: string;
}

export interface ExternalVisitorRules {
  allowed: boolean;
  approvalProcedure: string;
  safetyRequirements: string[];
  termsAndConditions: string[];
  contactNumber: string;
  email: string;
}

export interface Laboratory {
  id: string;
  name: string;
  department: string;
  building: string;
  floor: string;
  roomNumber: string;
  description: string;
  purpose: string;
  equipment: string[];
  facilities: string[];
  operatingSchedule: OperatingSchedule;
  eligibility: EligibilityRules;
  permissions: PermissionRules;
  staffContact: StaffContact;
  externalVisitorInfo: ExternalVisitorRules;
}

export interface QueueToken {
  id: string;
  labId: string;
  tokenNumber: string;
  numericSequence: number;
  registrationNumber: string;
  studentRef: string;
  studentName: string;
  purpose: string;
  requestedDurationMinutes: number;
  requestDate: string;
  submittedTimestamp: number;
  status: TokenStatus;
  callTimestamp: number | null;
  callExpiryTimestamp: number | null;
  sessionStartTime: number | null;
  sessionIntendedEndTime: number | null;
  sessionActualEndTime: number | null;
  actualDurationMinutes: number | null;
  isCarryover: boolean;
  originalTokenNumber: string | null;
  cancellationReason?: string;
  notes?: string;
}

export interface QueueStanding {
  token: QueueToken;
  position: number;
  studentsAhead: number;
  estimatedWaitMinutes: number;
  activeQueueLength: number;
}

export interface VerificationResult {
  eligible: boolean;
  reasons: string[];
  alternativeLabs?: { id: string; name: string }[];
  student?: {
    registrationNumber: string;
    name: string;
    department: string;
    academicYear: number;
  };
}

export interface AttendantStats {
  labId: string;
  labName: string;
  waitingStudents: number;
  currentlyUsing: number;
  servedToday: number;
  expiredTokens: number;
  dailyCapacity: number;
  remainingCapacity: number;
}
