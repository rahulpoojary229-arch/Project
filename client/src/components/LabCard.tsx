import React from 'react';
import { Laboratory } from '../types';
import { MapPin, Clock, Wrench, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

interface Props {
  lab: Laboratory;
  onViewDetails: (lab: Laboratory) => void;
  onRequestAccess: (lab: Laboratory) => void;
}

export const LabCard: React.FC<Props> = ({ lab, onViewDetails, onRequestAccess }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Header tag */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
            {lab.department}
          </span>
          <span className="text-[11px] font-medium text-gray-500 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {lab.operatingSchedule.openingTime} - {lab.operatingSchedule.closingTime}
          </span>
        </div>

        {/* Lab Name */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {lab.name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-xs text-gray-500 mt-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />
          <span>{lab.building} • {lab.floor}, {lab.roomNumber}</span>
        </div>

        {/* Purpose */}
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
          {lab.description}
        </p>

        {/* Equipment Badges */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center">
            <Wrench className="w-3 h-3 mr-1 text-gray-400" /> Key Equipment
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lab.equipment.slice(0, 3).map((eq, i) => (
              <span key={i} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                {eq}
              </span>
            ))}
            {lab.equipment.length > 3 && (
              <span className="text-[11px] text-gray-500 font-medium self-center">
                +{lab.equipment.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Permissions & Eligibility summary */}
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-2">
          <div>
            <span className="text-gray-400 block font-medium">Eligible Years</span>
            <span className="font-semibold text-gray-700">
              Years {lab.eligibility.eligibleAcademicYears.join(', ')}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Permission Needed</span>
            <span className="font-semibold text-gray-700">
              {lab.permissions.approvalRequiredFrom}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => onViewDetails(lab)}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          View Full Profile
        </button>

        <button
          onClick={() => onRequestAccess(lab)}
          className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1 shadow-xs"
        >
          <span>Request Access</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
