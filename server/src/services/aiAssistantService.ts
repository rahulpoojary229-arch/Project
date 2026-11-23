import { AssistantResponse, Laboratory } from '../types.js';
import { StorageService } from './storage.js';

export class AiAssistantService {
  private storage: StorageService;

  constructor() {
    this.storage = StorageService.getInstance();
  }

  public ask(query: string): AssistantResponse {
    const q = query.trim().toLowerCase();
    const labs = this.storage.getAllLabs();

    if (!q) {
      return {
        answer: 'Hello! I am Ask LabLink, your campus laboratory guide. You can ask me about lab locations, equipment (like 3D printers or oscilloscopes), eligibility, permissions, the 10-minute queue rules, or where to find your college registration number.',
        suggestedQuestions: [
          'Which lab has a 3D printer?',
          'Where is the Robotics lab located?',
          'Can a first-year student use the Electronics lab?',
          'Where do I find my college registration number?',
          'How does the 10-minute token rule work?'
        ]
      };
    }

    // 1. Where to find registration number
    if (q.includes('registration number') || q.includes('reg no') || q.includes('student id') || q.includes('find my id') || q.includes('college id')) {
      return {
        answer: 'You can locate your official College Registration Number in the following places:\n\n' +
          '• **Physical College ID Card**: Printed directly below your photo and barcode.\n' +
          '• **College Student Portal**: Visible on your profile dashboard upon login.\n' +
          '• **Admission Confirmation Documents**: Top-right corner of your official allotment letter.\n' +
          '• **Tuition Fee Receipts**: Recorded on all semester fee invoices.\n' +
          '• **Academic Administration Office**: Visit the Student Records counter in the Main Admin Block (Window 4).\n\n' +
          '*(For this demo, sample test numbers like `REG-2022-ME01`, `REG-2023-EC14`, `REG-2023-CS42`, `REG-2024-ME08`, or `REG-2025-CS99` can be used directly.)*',
        relevantTopics: ['Registration Number', 'Student Verification', 'Demo Records']
      };
    }

    // 2. Equipment query (e.g. "3D printer", "oscilloscope", "gpu", "robot arm", "laser cutter", "soldering")
    for (const lab of labs) {
      for (const eq of lab.equipment) {
        if (q.includes(eq.toLowerCase()) || (eq.toLowerCase().includes('3d printer') && q.includes('3d printer')) ||
            (eq.toLowerCase().includes('oscilloscope') && q.includes('oscilloscope')) ||
            (eq.toLowerCase().includes('robot') && q.includes('robot')) ||
            (eq.toLowerCase().includes('gpu') && (q.includes('gpu') || q.includes('a100') || q.includes('ai cluster')))) {
          return {
            answer: `**${eq}** is housed in the **${lab.name}**.\n\n` +
              `• **Location**: ${lab.building}, ${lab.floor}, ${lab.roomNumber}\n` +
              `• **Department**: ${lab.department}\n` +
              `• **Operating Hours**: ${lab.operatingSchedule.openingTime} – ${lab.operatingSchedule.closingTime} (${lab.operatingSchedule.operatingDays.join(', ')})\n` +
              `• **Eligibility**: Years [${lab.eligibility.eligibleAcademicYears.join(', ')}], Departments: [${lab.eligibility.eligibleDepartments.join(', ')}]\n` +
              `• **Permissions**: ${lab.permissions.procedure}\n` +
              `• **Session Limits**: ${lab.operatingSchedule.minDurationMinutes} to ${lab.operatingSchedule.maxDurationMinutes} minutes per session.`,
            sourceLabs: [lab.id],
            relevantTopics: ['Equipment Discovery', lab.name, 'Laboratory Location']
          };
        }
      }
    }

    // Generic 3D printer search fallback
    if (q.includes('3d printer') || q.includes('3d print') || q.includes('rapid prototyping')) {
      const mechLab = labs.find(l => l.id === 'lab-mech');
      if (mechLab) {
        return {
          answer: `The **${mechLab.name}** possesses both Industrial FDM (Ultimaker S5) and SLA Resin (Formlabs Form 3+) 3D printers.\n\n` +
            `• **Location**: ${mechLab.building}, ${mechLab.floor}, ${mechLab.roomNumber}\n` +
            `• **Eligibility**: Open to Years 1, 2, 3, and 4 in Engineering & Architecture.\n` +
            `• **Access Procedure**: ${mechLab.permissions.procedure}\n` +
            `• **Safety Requirement**: Workshop Safety Certification & Laser/Resin Handling workshop.`,
          sourceLabs: [mechLab.id]
        };
      }
    }

    // 3. Location of specific laboratories
    for (const lab of labs) {
      const nameLower = lab.name.toLowerCase();
      const deptLower = lab.department.toLowerCase();
      const idMatches = q.includes(lab.id.replace('lab-', ''));
      if (nameLower.split(' ').some(w => w.length > 3 && q.includes(w)) || idMatches) {
        if (q.includes('where') || q.includes('location') || q.includes('floor') || q.includes('room') || q.includes('building')) {
          return {
            answer: `The **${lab.name}** is located at:\n\n` +
              `• **Building**: ${lab.building}\n` +
              `• **Floor & Room**: ${lab.floor}, ${lab.roomNumber}\n` +
              `• **Department**: ${lab.department}\n` +
              `• **Hours**: ${lab.operatingSchedule.openingTime} to ${lab.operatingSchedule.closingTime}\n` +
              `• **Lab In-Charge**: ${lab.staffContact.labInChargeName} (${lab.staffContact.email})`,
            sourceLabs: [lab.id],
            relevantTopics: ['Location', lab.name]
          };
        }

        // Eligibility / First-year questions for this lab
        if (q.includes('eligible') || q.includes('first year') || q.includes('1st year') || q.includes('can i use') || q.includes('allowed')) {
          const firstYearAllowed = lab.eligibility.eligibleAcademicYears.includes(1);
          return {
            answer: `**Eligibility for ${lab.name}**:\n\n` +
              `• **Permitted Academic Years**: [${lab.eligibility.eligibleAcademicYears.map(y => `Year ${y}`).join(', ')}]\n` +
              `• **Can 1st-year students use it?**: ${firstYearAllowed ? 'Yes, first-year students are eligible!' : 'No, first-year students are not currently eligible. Access starts from Year ' + Math.min(...lab.eligibility.eligibleAcademicYears) + '.'}\n` +
              `• **Eligible Departments**: ${lab.eligibility.eligibleDepartments.join(', ')}\n` +
              `• **Required Safety Training**: ${lab.eligibility.requiredSafetyTraining.join('; ')}\n` +
              `• **Prerequisites**: ${lab.eligibility.prerequisiteSubjects.join(', ')}`,
            sourceLabs: [lab.id],
            relevantTopics: ['Eligibility', lab.name]
          };
        }

        // Permission query for this lab
        if (q.includes('permission') || q.includes('approval') || q.includes('hod') || q.includes('in-charge')) {
          return {
            answer: `**Permission Requirements for ${lab.name}**:\n\n` +
              `• **Approval Required From**: ${lab.permissions.approvalRequiredFrom}\n` +
              `• **HOD Approval Needed?**: ${lab.permissions.hodApprovalNeeded ? 'Yes, mandatory prior HOD endorsement.' : 'No, Lab In-Charge sign-off is sufficient.'}\n` +
              `• **When is permission required?**: ${lab.permissions.permissionTiming}\n` +
              `• **Procedure**: ${lab.permissions.procedure}\n` +
              `• **Contact Person**: ${lab.staffContact.labInChargeName} (${lab.staffContact.contactNumber})`,
            sourceLabs: [lab.id],
            relevantTopics: ['Permissions', lab.name]
          };
        }
      }
    }

    // 4. Queue / 10-Minute Rule / Token Reset explanation
    if (q.includes('10 minute') || q.includes('no show') || q.includes('no-show') || q.includes('countdown') || q.includes('expire')) {
      return {
        answer: '### The 10-Minute No-Show Rule\n\n' +
          '1. When the attendant calls your token, your status shifts to **"Your turn"**.\n' +
          '2. An official **10-minute countdown** starts using verified server timestamps.\n' +
          '3. You must report to the lab room and present your digital token before the timer hits 0.\n' +
          '4. Once the attendant verifies you, your status becomes **"Arrived"**.\n' +
          '5. If 10 minutes expire without arrival, your token is **automatically expired** and the next student in queue is called.\n' +
          '6. *Note*: Refreshing your browser does not reset the timer as expiry is locked on the server.',
        relevantTopics: ['10-Minute Rule', 'Token Expiry', 'Queue System']
      };
    }

    if (q.includes('token') || q.includes('queue') || q.includes('first come') || q.includes('carryover') || q.includes('reset') || q.includes('next day')) {
      return {
        answer: '### Smart Queue & Daily Reset Mechanics\n\n' +
          '• **First-Come, First-Served**: Requests are ordered strictly by original submission timestamp.\n' +
          '• **Daily Resets & Carryover**: If the lab closes before your turn is reached, your unserved request carries over to the next operating day.\n' +
          '• **Carryover Priority**: You are placed ahead of all new applicants on the next operating day, and your token restarts from `#01`.\n' +
          '• **Cancelled or Expired Tokens**: These do not carry over to the next day.',
        relevantTopics: ['Queue Tokens', 'Carryover Rules', 'First-Come First-Served']
      };
    }

    // 5. External Visitors
    if (q.includes('external') || q.includes('visitor') || q.includes('guest') || q.includes('outside')) {
      return {
        answer: '### External Visitor Access Guidelines\n\n' +
          'External researchers, industry partners, and community visitors may access select college laboratories under guided protocols without student credentials:\n\n' +
          '• **Dean Approval**: Must obtain prior Dean of Research endorsement at least 48 to 72 hours in advance.\n' +
          '• **Safety Requirements**: Valid ID badge, liability waiver, safety goggles/footwear, and department faculty chaperone.\n' +
          '• Check our **External Visitor Portal** on the main navigation bar for lab-specific contact numbers and guidelines.',
        relevantTopics: ['External Visitors', 'Campus Policy']
      };
    }

    // Fallback: strictly honest and grounded
    return {
      answer: `I could not find configured details regarding "${query}" in the active laboratory records.\n\n` +
        `Please consult the Department Academic Office or the College Central Laboratory Administrator for unconfigured facilities and custom access inquiries.`,
      suggestedQuestions: [
        'Which lab has a 3D printer?',
        'Where is the Robotics and Mechatronics Lab?',
        'Can a first-year student use the Electronics lab?',
        'Where do I find my college registration number?',
        'How does the 10-minute token rule work?'
      ]
    };
  }
}
