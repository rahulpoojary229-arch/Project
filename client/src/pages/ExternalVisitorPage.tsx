import React from 'react';
import { Laboratory } from '../types';
import { Users, ShieldCheck, FileCheck, Phone, Mail, AlertTriangle, Building, MapPin, CheckCircle2 } from 'lucide-react';

interface Props {
  labs: Laboratory[];
}

export const ExternalVisitorPage: React.FC<Props> = ({ labs }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-800/60 rounded-full text-emerald-200 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>Open Campus Visitor & Industry Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            External Visitor Laboratory Access Guidelines
          </h1>
          <p className="text-sm text-emerald-200 mt-2 leading-relaxed">
            Welcome to our college research infrastructure. Visiting researchers, industrial project partners, prospective scholars, and community makers can explore and request guided facility access under institutional safety protocols without needing student credentials.
          </p>
        </div>
      </div>

      {/* General Instructions & Approval Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1.5">1. Prior Approval Requisition</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            External access requires formal endorsement from the Dean of Research or relevant Department Head at least 48 to 72 hours prior to arrival.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1.5">2. Mandatory Safety Clearance</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Visitors must present official government ID at campus security gate 1, collect a visitor badge, and review laboratory specific PPE instructions.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1.5">3. Chaperoned Laboratory Tour</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            All external laboratory sessions are conducted under the direct supervision of an authorized college faculty liaison or senior laboratory attendant.
          </p>
        </div>
      </div>

      {/* Terms & Conditions Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-xs text-gray-700 space-y-2">
        <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
          Institutional Terms & Conditions for External Visitors
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-gray-600 leading-relaxed">
          <li>Visitors are strictly prohibited from operating high-voltage or heavy CNC equipment without direct attendant execution.</li>
          <li>Commercial product prototyping tariffs apply as per the College Innovation & Incubation Council guidelines.</li>
          <li>All visitors must sign a campus intellectual safety waiver and non-disclosure liability acknowledgment.</li>
          <li>Zero accounts or credentials are required to view this directory or contact facility administrators.</li>
        </ul>
      </div>

      {/* Lab-Specific External Visitor Protocols & Contacts */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
          <Building className="w-4 h-4 mr-2 text-emerald-600" />
          Facility-Specific Visitor Access & Demo Contacts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labs.map(lab => (
            <div key={lab.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {lab.department}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Floor: {lab.floor}, {lab.roomNumber}
                  </span>
                </div>
                <h4 className="text-base font-bold text-gray-900">{lab.name}</h4>
                <div className="flex items-center text-xs text-gray-500 mt-0.5 mb-3">
                  <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                  <span>{lab.building}</span>
                </div>

                <div className="text-xs text-gray-600 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="font-semibold text-gray-700">Access Protocol:</span>{' '}
                    {lab.externalVisitorInfo.approvalProcedure}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Safety Precautions:</span>
                    <ul className="list-disc pl-4 mt-1 text-[11px] text-gray-600">
                      {lab.externalVisitorInfo.safetyRequirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
                <div className="font-semibold text-gray-700 text-[11px] mb-1">
                  Lab In-Charge Contact (Fictional Demo Details):
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-gray-600 text-xs gap-1">
                  <span className="flex items-center font-medium">
                    <Phone className="w-3 h-3 mr-1 text-emerald-600" />
                    {lab.externalVisitorInfo.contactNumber}
                  </span>
                  <span className="flex items-center font-medium">
                    <Mail className="w-3 h-3 mr-1 text-emerald-600" />
                    {lab.externalVisitorInfo.email}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
