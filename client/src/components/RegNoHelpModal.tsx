import React from 'react';
import { X, CreditCard, Laptop, FileText, Receipt, Building2, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectDemoStudent?: (regNo: string) => void;
}

export const RegNoHelpModal: React.FC<Props> = ({ isOpen, onClose, onSelectDemoStudent }) => {
  if (!isOpen) return null;

  const locations = [
    {
      icon: CreditCard,
      title: 'Physical College ID Card',
      desc: 'Printed directly below your photograph and barcode on your student PVC smartcard.'
    },
    {
      icon: Laptop,
      title: 'Student ERP / Web Portal',
      desc: 'Displayed prominently in the top-right profile header once you log into the college portal.'
    },
    {
      icon: FileText,
      title: 'Admission Confirmation Letter',
      desc: 'Located in the top header section of your official counseling allotment and enrollment memo.'
    },
    {
      icon: Receipt,
      title: 'Tuition Fee Receipts',
      desc: 'Listed as the primary student reference identifier on all bank and finance receipts.'
    },
    {
      icon: Building2,
      title: 'College Administration Office',
      desc: 'Available at Counter 4 (Student Records & Welfare) in the Main Administrative Block.'
    }
  ];

  const demoAccounts = [
    { reg: 'REG-2022-ME01', name: 'Aarav Sharma', dept: 'Mechatronics', yr: 'Year 4', note: 'All safety trainings & HOD approval' },
    { reg: 'REG-2023-EC14', name: 'Pooja Hegde', dept: 'ECE', yr: 'Year 3', note: 'Electrical safety & ECE eligibility' },
    { reg: 'REG-2023-CS42', name: 'Rohan Gupta', dept: 'CSE', yr: 'Year 3', note: 'AI Lab & general workshop' },
    { reg: 'REG-2024-ME08', name: 'Sneha Patel', dept: 'Mechanical', yr: 'Year 2', note: 'Fab Lab & 3D printing certified' },
    { reg: 'REG-2025-CS99', name: 'Karan Verma', dept: 'CSE', yr: 'Year 1', note: 'Fresh student (tests ineligibility feedback)' }
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-card max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Finding Your Registration Number</h3>
            <p className="text-xs text-gray-500">Official student identity lookup guidance</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            In actual college deployments, your registration number establishes your enrolled academic year, department, and completed safety certifications. You can find it on:
          </p>

          <div className="space-y-2">
            {locations.map((loc, idx) => {
              const Icon = loc.icon;
              return (
                <div key={idx} className="flex items-start p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mr-3 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{loc.title}</h5>
                    <p className="text-gray-500 text-[11px] mt-0.5">{loc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Demonstration Sample Records */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center text-xs font-bold text-indigo-900 mb-2">
              <Sparkles className="w-4 h-4 mr-1 text-indigo-600" />
              Pre-configured Demo Student Records
            </div>
            <p className="text-[11px] text-gray-500 mb-2.5">
              Click any sample profile below to copy its registration number for testing:
            </p>

            <div className="space-y-1.5">
              {demoAccounts.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (onSelectDemoStudent) onSelectDemoStudent(acc.reg);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-indigo-700">{acc.reg}</span>
                    <span className="text-gray-600 ml-2 font-medium">{acc.name}</span>
                    <span className="text-gray-400 text-[11px] ml-1">({acc.dept}, {acc.yr})</span>
                  </div>
                  <span className="text-[10px] text-gray-400 italic">{acc.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
