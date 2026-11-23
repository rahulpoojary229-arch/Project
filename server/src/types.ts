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
  openingTime: string; // HH:mm format, e.g., "09:00"
  closingTime: string; // HH:mm format, e.g., "17:00"
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

export interface StudentRecord {
  registrationNumber: string;
  name: string;
  department: string;
  academicYear: number;
  completedSafetyTrainings: string[];
  hodApprovals: string[]; // List of labIds for which student has HOD approval
}

export interface QueueToken {
  id: string;
  labId: string;
  tokenNumber: string; // e.g., "#01"
  numericSequence: number; // 1, 2, ...
  registrationNumber: string;
  studentRef: string; // Internal sanitized reference e.g., "STU-XXXX"
  studentName: string;
  purpose: string;
  requestedDurationMinutes: number;
  requestDate: string; // YYYY-MM-DD
  submittedTimestamp: number; // Original epoch ms (preserved across carryover)
  status: TokenStatus;
  callTimestamp: number | null; // When attendant clicked "Call Next"
  callExpiryTimestamp: number | null; // callTimestamp + 10 mins
  sessionStartTime: number | null;
  sessionIntendedEndTime: number | null;
  sessionActualEndTime: number | null;
  actualDurationMinutes: number | null;
  isCarryover: boolean;
  originalTokenNumber: string | null;
  cancellationReason?: string;
  notes?: string;
}

export interface QueueState {
  currentDate: string; // YYYY-MM-DD
  tokens: QueueToken[];
}

export interface LabQueueSummary {
  labId: string;
  labName: string;
  waitingCount: number;
  inUseCount: number;
  servedCount: number;
  expiredCount: number;
  cancelledCount: number;
  remainingCapacity: number;
  currentToken: QueueToken | null; // currently called or in use
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

export interface AssistantResponse {
  answer: string;
  sourceLabs?: string[];
  relevantTopics?: string[];
  suggestedQuestions?: string[];
}
