import { StudentRecord } from '../types.js';

/**
 * DEMONSTRATION STUDENT RECORDS NOTICE:
 * All student names, departments, registration numbers, and records below are
 * fictional demonstration records for testing the LabLink MVP eligibility engine.
 * They do not reflect real college students or private records.
 */

export const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    registrationNumber: 'REG-2022-ME01',
    name: 'Aarav Sharma',
    department: 'Mechatronics',
    academicYear: 4,
    completedSafetyTrainings: [
      'General Electrical Safety Workshop',
      'Soldering Hazards & Fume Safety',
      'Robotics Emergency Stop & Hazard Management',
      'Industrial Arm Safety Protocol',
      'Workshop Safety Certification',
      'Laser Cutter & Chemical Resin Handling',
      'Information Security & Lab Acceptable Use Policy'
    ],
    hodApprovals: ['lab-robotics', 'lab-elec', 'lab-mech', 'lab-cs']
  },
  {
    registrationNumber: 'REG-2023-EC14',
    name: 'Pooja Hegde',
    department: 'ECE',
    academicYear: 3,
    completedSafetyTrainings: [
      'General Electrical Safety Workshop',
      'Soldering Hazards & Fume Safety',
      'Workshop Safety Certification',
      'Information Security & Lab Acceptable Use Policy'
    ],
    hodApprovals: ['lab-elec']
  },
  {
    registrationNumber: 'REG-2023-CS42',
    name: 'Rohan Gupta',
    department: 'CSE',
    academicYear: 3,
    completedSafetyTrainings: [
      'Information Security & Lab Acceptable Use Policy',
      'Workshop Safety Certification'
    ],
    hodApprovals: []
  },
  {
    registrationNumber: 'REG-2024-ME08',
    name: 'Sneha Patel',
    department: 'Mechanical',
    academicYear: 2,
    completedSafetyTrainings: [
      'Workshop Safety Certification',
      'Laser Cutter & Chemical Resin Handling'
    ],
    hodApprovals: ['lab-mech']
  },
  {
    registrationNumber: 'REG-2025-CS99',
    name: 'Karan Verma',
    department: 'CSE',
    academicYear: 1, // 1st year student
    completedSafetyTrainings: [
      'Information Security & Lab Acceptable Use Policy'
    ],
    hodApprovals: []
  }
];
