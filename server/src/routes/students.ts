import { Router } from 'express';
import { StorageService } from '../services/storage.js';
import { VerificationService } from '../services/verificationService.js';

export const studentsRouter = Router();
const storage = StorageService.getInstance();
const verificationService = new VerificationService();

// GET /api/students/demo - get sample demo student profiles for testing
studentsRouter.get('/demo', (req, res) => {
  const demoStudents = storage.getAllDemoStudents().map(s => ({
    registrationNumber: s.registrationNumber,
    name: s.name,
    department: s.department,
    academicYear: s.academicYear,
    completedSafetyTrainings: s.completedSafetyTrainings,
    hodApprovals: s.hodApprovals
  }));
  res.json({ success: true, students: demoStudents });
});

// POST /api/students/verify - verify eligibility for a lab
studentsRouter.post('/verify', (req, res) => {
  const { registrationNumber, labId } = req.body;
  if (!registrationNumber || !labId) {
    return res.status(400).json({ success: false, error: 'Registration number and labId are required.' });
  }

  const result = verificationService.verifyEligibility(registrationNumber, labId);
  res.json({ success: true, result });
});

// GET /api/students/help - assistance for finding registration number
studentsRouter.get('/help', (req, res) => {
  res.json({
    success: true,
    help: {
      title: 'Where to Find Your College Registration Number',
      locations: [
        {
          source: 'Physical College ID Card',
          detail: 'Look on the front face of your student smartcard, right under your photograph.'
        },
        {
          source: 'Student Portal Dashboard',
          detail: 'Log into your college ERP/Student Portal and see the top header banner.'
        },
        {
          source: 'Admission Confirmation Letter',
          detail: 'Printed in the top-right block of your official counseling allotment memo.'
        },
        {
          source: 'Semester Fee Receipts',
          detail: 'Shown on all digitally issued tuition fee receipts from the accounts office.'
        },
        {
          source: 'College Administration Office',
          detail: 'Visit Student Welfare Counter 4 in the Main Administrative Block.'
        }
      ],
      demoNote: 'For this competition evaluation, use any of the pre-configured demo registration numbers: REG-2022-ME01, REG-2023-EC14, REG-2023-CS42, REG-2024-ME08, or REG-2025-CS99.'
    }
  });
});
