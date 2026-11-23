import React from 'react';
import { Laboratory } from '../types';
import { X, MapPin, Clock, Wrench, ShieldAlert, UserCheck, Phone, Mail, Users, CheckCircle2 } from 'lucide-react';

interface Props {
  lab: Laboratory | null;
  onClose: () => void;
  onRequestAccess: (lab: Laboratory) => void;
}

export const LabDetailModal: React.FC<Props> = ({ lab, onClose, onRequestAccess }) => {
  if (!lab) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {lab.department}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                {lab.operatingSchedule.openingTime} – {lab.operatingSchedule.closingTime} ({lab.operatingSchedule.operatingDays.join(', ')})
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{lab.name}</h2>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1" />
              <span>{lab.building} • {lab.floor}, {lab.roomNumber}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-6 text-sm">
          {/* Purpose & Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description & Purpose</h4>
            <p className="text-gray-700 leading-relaxed">{lab.description}</p>
            <p className="text-gray-600 text-xs mt-2 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
              <strong>Academic Purpose:</strong> {lab.purpose}
            </p>
          </div>

          {/* Equipment & Facilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-xs uppercase tracking-wider">
                <Wrench className="w-4 h-4 mr-1.5 text-indigo-600" /> Available Equipment
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {lab.equipment.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 mr-2 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Lab Facilities
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {lab.facilities.map((fac, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 shrink-0"></span>
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Eligibility & Permissions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-indigo-100 bg-indigo-50/40 p-4 rounded-xl">
              <h4 className="font-semibold text-indigo-900 mb-2 text-xs uppercase tracking-wider flex items-center">
                <UserCheck className="w-4 h-4 mr-1.5 text-indigo-700" /> Eligibility Criteria
              </h4>
              <div className="space-y-2 text-xs text-indigo-950">
                <div>
                  <span className="font-semibold text-indigo-800">Eligible Years:</span>{' '}
                  Years {lab.eligibility.eligibleAcademicYears.join(', ')}
                </div>
                <div>
                  <span className="font-semibold text-indigo-800">Departments:</span>{' '}
                  {lab.eligibility.eligibleDepartments.join(', ')}
                </div>
                <div>
                  <span className="font-semibold text-indigo-800">Prerequisites:</span>{' '}
                  {lab.eligibility.prerequisiteSubjects.join(', ')}
                </div>
                <div>
                  <span className="font-semibold text-indigo-800">Mandatory Safety Training:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {lab.eligibility.requiredSafetyTraining.map((st, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-indigo-200 rounded text-[11px] font-medium text-indigo-900">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-amber-100 bg-amber-50/40 p-4 rounded-xl">
              <h4 className="font-semibold text-amber-900 mb-2 text-xs uppercase tracking-wider flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-700" /> Permission Requirements
              </h4>
              <div className="space-y-2 text-xs text-amber-950">
                <div>
                  <span className="font-semibold text-amber-800">Approval Authority:</span>{' '}
                  {lab.permissions.approvalRequiredFrom}
                </div>
                <div>
                  <span className="font-semibold text-amber-800">HOD Endorsement:</span>{' '}
                  {lab.permissions.hodApprovalNeeded ? 'Required prior to queue entry' : 'Not required (Lab in-charge sign-off sufficient)'}
                </div>
                <div>
                  <span className="font-semibold text-amber-800">Timing:</span>{' '}
                  {lab.permissions.permissionTiming}
                </div>
                <div className="pt-1">
                  <span className="font-semibold text-amber-800">Procedure:</span>
                  <p className="mt-0.5 text-amber-900 leading-normal bg-white/70 p-2 rounded border border-amber-200">
                    {lab.permissions.procedure}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Rules & Session Durations */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Usage Duration & Capacity Rules</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Min Session</span>
                <span className="font-bold text-gray-800">{lab.operatingSchedule.minDurationMinutes} minutes</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Max Session</span>
                <span className="font-bold text-gray-800">{lab.operatingSchedule.maxDurationMinutes} minutes</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Daily Capacity</span>
                <span className="font-bold text-gray-800">{lab.operatingSchedule.dailyStudentCapacity} students/day</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[11px]">Extensions</span>
                <span className="font-bold text-gray-800">{lab.operatingSchedule.allowExtensions ? 'Permitted if available' : 'Strict limit'}</span>
              </div>
            </div>
          </div>

          {/* Lab Staff Contact */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-100/70 rounded-xl text-xs gap-3">
            <div>
              <span className="text-gray-500 font-medium block">Lab In-Charge (Fictional Demo):</span>
              <span className="font-bold text-gray-900 text-sm">{lab.staffContact.labInChargeName}</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1 text-gray-400" /> {lab.staffContact.contactNumber}</span>
              <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-gray-400" /> {lab.staffContact.email}</span>
            </div>
          </div>

          {/* External Visitor Notes */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950">
            <div className="font-semibold text-emerald-900 mb-1 flex items-center">
              <Users className="w-4 h-4 mr-1 text-emerald-700" /> External Visitor Policy
            </div>
            <p className="leading-relaxed">{lab.externalVisitorInfo.approvalProcedure}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onRequestAccess(lab);
            }}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            Request Access for this Laboratory
          </button>
        </div>
      </div>
    </div>
  );
};
