import React from 'react';
import { GraduationCap, ShieldAlert, Users, Compass, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSelectRole: (role: 'student' | 'attendant' | 'visitor') => void;
  onClose?: () => void;
}

export const RoleSelectionModal: React.FC<Props> = ({ isOpen, onSelectRole }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to LabLink</h2>
          <p className="text-sm text-gray-500 mt-1">
            Making college laboratories accessible, transparent, and organized.
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-medium">
            Demo MVP • Zero-Authentication • No Login Required
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4 text-center font-medium">
          Select a persona to explore the system:
        </p>

        <div className="space-y-3">
          {/* Option 1: Student */}
          <button
            onClick={() => onSelectRole('student')}
            className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/40 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mr-4 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 group-hover:text-indigo-600">
                1. Student Dashboard
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Explore labs, verify eligibility, check permission procedures, and join smart queues.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Option 2: Lab Attendant */}
          <button
            onClick={() => onSelectRole('attendant')}
            className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mr-4 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                2. Lab Attendant Dashboard
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage live queues, call next tokens, monitor 10-minute timers, and trigger day closure.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Option 3: External Visitor */}
          <button
            onClick={() => onSelectRole('visitor')}
            className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mr-4 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 group-hover:text-emerald-600">
                3. External Visitor Information
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Review visitor policies, terms, lab approval steps, and contact details without student accounts.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Action 4: Skip -> Continue as Student */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Default interface: <strong>Student</strong>
          </div>
          <button
            onClick={() => onSelectRole('student')}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center"
          >
            <span>Skip → Continue as Student</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>

        <div className="mt-4 p-2.5 bg-gray-50 rounded-lg text-[11px] text-gray-500 leading-relaxed border border-gray-200">
          <strong>Notice for Evaluators:</strong> In compliance with challenge guidelines, no login or authentication is required. You can freely toggle between Student, Attendant, and Visitor views at any time using the role selector in the navigation bar.
        </div>
      </div>
    </div>
  );
};
