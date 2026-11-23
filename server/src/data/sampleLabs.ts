import { Laboratory } from '../types.js';

/**
 * DEMONSTRATION DATA NOTICE:
 * All laboratory names, locations, contact numbers, and personnel details below are
 * fictional demonstration data for the LabLink MVP challenge. They do not represent
 * actual college records or real personnel.
 */

export const SAMPLE_LABORATORIES: Laboratory[] = [
  {
    id: 'lab-elec',
    name: 'Electronics and Embedded Systems Lab',
    department: 'Electronics & Communication Engineering',
    building: 'APJ Abdul Kalam Science & Tech Block',
    floor: '2nd Floor',
    roomNumber: 'Room 204',
    description: 'Specialized lab equipped for microcontrollers, embedded systems design, circuit testing, and PCB prototyping.',
    purpose: 'Hands-on hardware development, IoT edge device testing, and analog/digital circuit synthesis for undergraduate and graduate coursework.',
    equipment: [
      'Digital Storage Oscilloscopes (100MHz)',
      'ARM Cortex-M4 Development Kits',
      'FPGA Xilinx Spartan-7 Boards',
      'Function / Arbitrary Waveform Generators',
      'Dual-Channel Benchtop DC Power Supplies',
      'Soldering Stations with Fume Extractors',
      'Logic Analyzers (16-Channel)',
      'SMD Rework Station'
    ],
    facilities: [
      'ESD-safe anti-static workstations',
      'High-speed Ethernet & dedicated IoT testing subnets',
      'Component stockroom (passives, sensors, ICs)',
      'First aid & emergency eyewash station'
    ],
    operatingSchedule: {
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      openingTime: '09:00',
      closingTime: '17:00',
      dailyStudentCapacity: 35,
      dailyUsageMinutesCapacity: 2100,
      minDurationMinutes: 15,
      maxDurationMinutes: 120,
      allowExtensions: true
    },
    eligibility: {
      eligibleAcademicYears: [2, 3, 4],
      eligibleDepartments: ['ECE', 'EEE', 'CSE', 'Instrumentation', 'Mechatronics'],
      prerequisiteSubjects: ['Basic Electrical Engineering', 'Digital System Design'],
      requiredSafetyTraining: ['General Electrical Safety Workshop', 'Soldering Hazards & Fume Safety'],
      alternativeLabSuggestions: ['lab-cs']
    },
    permissions: {
      approvalRequiredFrom: 'Lab In-Charge',
      hodApprovalNeeded: false,
      permissionTiming: 'Before joining queue',
      procedure: 'Submit academic project proposal or course assignment slip endorsed by subject instructor to the Lab In-Charge.'
    },
    staffContact: {
      labInChargeName: 'Prof. Arvind Nambiar (Demo)',
      contactNumber: '+91 98765 43210 (Fictional Demo)',
      email: 'arvind.nambiar.demo@college.edu'
    },
    externalVisitorInfo: {
      allowed: true,
      approvalProcedure: 'External industry partners, researchers, or prospective students must obtain written dean endorsement 48 hours prior to arrival.',
      safetyRequirements: [
        'Mandatory visitor badge display',
        'Signed safety non-disclosure liability waiver',
        'Accompanied by authorized department faculty at all times'
      ],
      termsAndConditions: [
        'No direct usage of soldering or high-voltage equipment without attendant oversight',
        'Visitor access restricted to inspection and guided demonstration sessions'
      ],
      contactNumber: '+91 98765 43210 (Demo Contact)',
      email: 'external.access.elec.demo@college.edu'
    }
  },
  {
    id: 'lab-robotics',
    name: 'Robotics and Mechatronics Lab',
    department: 'Mechatronics & Automation',
    building: 'Dr. Vikram Sarabhai Engineering Center',
    floor: 'Ground Floor',
    roomNumber: 'Room 012',
    description: 'Advanced interdisciplinary laboratory featuring industrial robot arms, ROS-based autonomous mobile robots, computer vision rigs, and pneumatic test benches.',
    purpose: 'Developing autonomous navigation, kinematics modeling, industrial manipulator control, and sensor fusion for multi-robot swarms.',
    equipment: [
      '6-DOF Industrial Robotic Manipulator (UR5e)',
      'TurtleBot3 Autonomous Mobile Robots (LiDAR + Depth Camera)',
      'OptiTrack Motion Capture System',
      'Pneumatics and Electro-Hydraulics Training Rig',
      'NVIDIA Jetson AGX Orin Edge AI Workstations',
      'Stereo Vision Cameras & Intel RealSense D435i',
      'Quadruped Robot Platform (Unitree Go1)'
    ],
    facilities: [
      'Overhead tethered safety cable grid',
      'Demarcated safety perimeter cage',
      'Heavy-duty 3-phase power line',
      'Calibrated planar arena for ground navigation'
    ],
    operatingSchedule: {
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      openingTime: '09:30',
      closingTime: '16:30',
      dailyStudentCapacity: 20,
      dailyUsageMinutesCapacity: 1500,
      minDurationMinutes: 30,
      maxDurationMinutes: 120,
      allowExtensions: false
    },
    eligibility: {
      eligibleAcademicYears: [3, 4],
      eligibleDepartments: ['Mechatronics', 'Mechanical', 'ECE', 'CSE'],
      prerequisiteSubjects: ['Kinematics & Dynamics', 'Robotics Operating System (ROS) Basics'],
      requiredSafetyTraining: ['Robotics Emergency Stop & Hazard Management', 'Industrial Arm Safety Protocol'],
      alternativeLabSuggestions: ['lab-mech', 'lab-elec']
    },
    permissions: {
      approvalRequiredFrom: 'Head of Department (HOD)',
      hodApprovalNeeded: true,
      permissionTiming: 'Before joining queue',
      procedure: 'HOD approval required along with supervisor endorsement due to high-risk industrial machinery.'
    },
    staffContact: {
      labInChargeName: 'Dr. Sunita Deshmukh (Demo)',
      contactNumber: '+91 98765 43211 (Fictional Demo)',
      email: 'sunita.deshmukh.demo@college.edu'
    },
    externalVisitorInfo: {
      allowed: true,
      approvalProcedure: 'Academic researchers and school excursion teams must submit a formal requisition through the College Research Dean at least 3 business days prior.',
      safetyRequirements: [
        'Mandatory steel-toe footwear in arena area',
        'Strict clearance: 2 meters distance from active robot perimeter'
      ],
      termsAndConditions: [
        'Emergency stop must be demonstrated by attendant prior to room entry',
        'Photography permitted only for approved educational media'
      ],
      contactNumber: '+91 98765 43211 (Demo Contact)',
      email: 'robotics.visitors.demo@college.edu'
    }
  },
  {
    id: 'lab-mech',
    name: 'Mechanical Fabrication and 3D Printing Lab',
    department: 'Mechanical Engineering',
    building: 'Sir M. Visvesvaraya Workshop Complex',
    floor: '1st Floor',
    roomNumber: 'Room 110',
    description: 'Rapid prototyping and precision manufacturing facility housing modern additive and subtractive manufacturing tools.',
    purpose: 'Rapid product design, rapid 3D printing of functional parts, precision laser cutting, and structural testing of engineered prototypes.',
    equipment: [
      '3D printer (Industrial Dual-Extruder FDM - Ultimaker S5)',
      '3D printer (SLA Resin High Precision - Formlabs Form 3+)',
      'CO2 Laser Cutting & Engraving System (100W)',
      'CNC 3-Axis Desktop Milling Machine',
      'Vacuum Forming Machine',
      'Electronic Digital Vernier Calipers and Micrometers',
      'Filament Dehydrators & Post-Processing Wash/Cure Station'
    ],
    facilities: [
      'High-capacity HEPA + carbon air filtration exhaust',
      'Compressed air line network (8 bar)',
      'Flame-retardant storage cabinets for resins and solvents',
      'Post-processing sandblaster and water jet cabinet'
    ],
    operatingSchedule: {
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openingTime: '08:30',
      closingTime: '17:30',
      dailyStudentCapacity: 25,
      dailyUsageMinutesCapacity: 1800,
      minDurationMinutes: 30,
      maxDurationMinutes: 180,
      allowExtensions: true
    },
    eligibility: {
      eligibleAcademicYears: [1, 2, 3, 4],
      eligibleDepartments: ['Mechanical', 'Civil', 'Mechatronics', 'Design', 'Architecture', 'ECE', 'CSE'],
      prerequisiteSubjects: ['Engineering Graphics & CAD Basics'],
      requiredSafetyTraining: ['Workshop Safety Certification', 'Laser Cutter & Chemical Resin Handling'],
      alternativeLabSuggestions: ['lab-robotics']
    },
    permissions: {
      approvalRequiredFrom: 'Lab In-Charge',
      hodApprovalNeeded: false,
      permissionTiming: 'Before entering laboratory',
      procedure: 'Sign off digital STL/CAD slice verification with the workshop technical officer before physical equipment access.'
    },
    staffContact: {
      labInChargeName: 'Er. Rajesh Kulkarni (Demo)',
      contactNumber: '+91 98765 43212 (Fictional Demo)',
      email: 'rajesh.kulkarni.demo@college.edu'
    },
    externalVisitorInfo: {
      allowed: true,
      approvalProcedure: 'External startup incubatees or community makers may request time slots during designated Saturday Community Fabrication Hours.',
      safetyRequirements: [
        'Safety goggles mandatory at all times',
        'Nitrile gloves required in resin curing zone'
      ],
      termsAndConditions: [
        'Commercial raw materials must be pre-approved for flashpoint and toxicity',
        'Machine operating charges apply as per College Innovation Cell tariff'
      ],
      contactNumber: '+91 98765 43212 (Demo Contact)',
      email: 'fablab.external.demo@college.edu'
    }
  },
  {
    id: 'lab-cs',
    name: 'Computer Science and AI Lab',
    department: 'Computer Science & Engineering',
    building: 'Alan Turing Computing Center',
    floor: '3rd Floor',
    roomNumber: 'Room 301',
    description: 'High-performance computing cluster and AI development laboratory equipped with GPU-accelerated workstations and cloud orchestration.',
    purpose: 'Deep learning model training, distributed computing experiments, computer vision pipelines, and full-stack web software engineering.',
    equipment: [
      'NVIDIA A100 (80GB) Compute Node Cluster',
      'Dual-Monitor GPU Workstations (RTX 4090, 64GB RAM)',
      'Bare-metal Kubernetes Training Rack',
      'VR / Mixed Reality Headsets (Meta Quest 3 & Apple Vision Pro Demo)',
      'High-Speed 10Gbps Fiber Backbone Switch',
      'Edge TPU Coral Accelerator Modules'
    ],
    facilities: [
      'Climate-controlled server room environment (20°C)',
      'Dual redundant UPS battery backup (40kVA)',
      'Dual-zone clean acoustic study pods',
      'Ultra-ergonomic mesh chairs and dual-screen monitor arms'
    ],
    operatingSchedule: {
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      openingTime: '08:00',
      closingTime: '20:00',
      dailyStudentCapacity: 60,
      dailyUsageMinutesCapacity: 3600,
      minDurationMinutes: 15,
      maxDurationMinutes: 180,
      allowExtensions: true
    },
    eligibility: {
      eligibleAcademicYears: [1, 2, 3, 4],
      eligibleDepartments: ['CSE', 'Information Technology', 'AI & Data Science', 'ECE'],
      prerequisiteSubjects: ['Data Structures & Algorithms', 'Linux Command Line Basics'],
      requiredSafetyTraining: ['Information Security & Lab Acceptable Use Policy'],
      alternativeLabSuggestions: ['lab-elec']
    },
    permissions: {
      approvalRequiredFrom: 'None',
      hodApprovalNeeded: false,
      permissionTiming: 'Before entering laboratory',
      procedure: 'Open access for enrolled computing students; access card / token validation at turnstile.'
    },
    staffContact: {
      labInChargeName: 'Prof. Meenakshi Raman (Demo)',
      contactNumber: '+91 98765 43213 (Fictional Demo)',
      email: 'meenakshi.raman.demo@college.edu'
    },
    externalVisitorInfo: {
      allowed: true,
      approvalProcedure: 'Hackathon participants, visiting guest lecturers, and tech recruiters can enter through the Reception Desk register in Alan Turing Center.',
      safetyRequirements: [
        'Adherence to College Cyber Ethics & Network Security Policy',
        'No external USB insertion into GPU cluster master nodes'
      ],
      termsAndConditions: [
        'Guest Wi-Fi credentials issued upon presenting official government photo identification',
        'Compute node allocation subject to departmental review'
      ],
      contactNumber: '+91 98765 43213 (Demo Contact)',
      email: 'csai.external.demo@college.edu'
    }
  }
];
