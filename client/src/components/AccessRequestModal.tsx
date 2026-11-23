import React, { useState } from 'react';
import { Laboratory, QueueToken } from '../types';
import { api } from '../services/api';
import { X, AlertCircle, CheckCircle2, Clock, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  lab: Laboratory | null;
  allLabs: Laboratory[];
  onClose: () => void;
  onSuccess: (token: QueueToken) => void;
  onOpenHelp: () => void;
}

export const AccessRequestModal: React.FC<Props> = ({
  lab,
  allLabs,
  onClose,
  onSuccess,
  onOpenHelp
}) => {
  const [selectedLabId, setSelectedLabId] = useState<string>(lab?.id || allLabs[0]?.id || '');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [requestDate, setRequestDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failureReasons, setFailureReasons] = useState<string[]>([]);
  const [alternativeLabs, setAlternativeLabs] = useState<{ id: string; name: string }[]>([]);

  const currentLab = allLabs.find(l => l.id === selectedLabId) || lab;

  const handleQuickDemoFill = (regNo: string, defPurpose: string, defDur: number) => {
    setRegistrationNumber(regNo);
    setPurpose(defPurpose);
    setDuration(defDur);
    setErrorMsg(null);
    setFailureReasons([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLab) return;

    setLoading(true);
    setErrorMsg(null);
    setFailureReasons([]);
    setAlternativeLabs([]);

    try {
      const response = await api.requestAccess({
        registrationNumber: registrationNumber.trim(),
        labId: currentLab.id,
        purpose: purpose.trim(),
        requestedDurationMinutes: Number(duration),
        requestDate
      });

      if (response.success && response.token) {
        onSuccess(response.token);
      } else {
        setErrorMsg(response.error || 'Failed to request access.');
        if (response.reasons && response.reasons.length > 0) {
          setFailureReasons(response.reasons);
        }
        // Fetch alternatives if not returned directly
        if (currentLab.eligibility.alternativeLabSuggestions) {
          const alts = currentLab.eligibility.alternativeLabSuggestions
            .map(id => allLabs.find(l => l.id === id))
            .filter((l): l is Laboratory => l !== undefined)
            .map(l => ({ id: l.id, name: l.name }));
          setAlternativeLabs(alts);
        }
      }
    } catch (err: any) {
      setErrorMsg('Network error occurred. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentLab) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Request Laboratory Access</h3>
            <p className="text-xs text-gray-500">Join the first-come, first-served smart queue</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Fill Pill */}
        <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs">
          <div className="font-semibold text-indigo-900 mb-1 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Quick Demo Fills (Simulated Students):
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('REG-2022-ME01', 'Robotics ROS Project', 60)}
              className="px-2 py-1 bg-white border border-indigo-200 hover:border-indigo-400 rounded-md text-[11px] font-medium text-indigo-700"
            >
              Aarav (4th Yr Mech, All Cleared)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('REG-2023-EC14', 'Oscilloscope testing', 45)}
              className="px-2 py-1 bg-white border border-indigo-200 hover:border-indigo-400 rounded-md text-[11px] font-medium text-indigo-700"
            >
              Pooja (3rd Yr ECE, Elec Cleared)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('REG-2025-CS99', 'Introductory experimentation', 30)}
              className="px-2 py-1 bg-white border border-indigo-200 hover:border-indigo-400 rounded-md text-[11px] font-medium text-amber-700"
            >
              Karan (1st Yr CSE, Tests Ineligibility)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Laboratory Selector */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Target Laboratory</label>
            <select
              value={selectedLabId}
              onChange={e => setSelectedLabId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {allLabs.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.department})
                </option>
              ))}
            </select>
            <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
              <span>Limits: {currentLab.operatingSchedule.minDurationMinutes} – {currentLab.operatingSchedule.maxDurationMinutes} mins</span>
              <span>Capacity: {currentLab.operatingSchedule.dailyStudentCapacity} students/day</span>
            </div>
          </div>

          {/* Student Registration Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-gray-700">College Registration Number</label>
              <button
                type="button"
                onClick={onOpenHelp}
                className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium flex items-center"
              >
                <HelpCircle className="w-3 h-3 mr-0.5" /> Where to find this?
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. REG-2023-EC14"
              value={registrationNumber}
              onChange={e => setRegistrationNumber(e.target.value.toUpperCase())}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs uppercase font-mono tracking-wider focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Registration numbers are verified against simulated college records; internal hashed references are used in the public queue.
            </span>
          </div>

          {/* Purpose of Usage */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Purpose of Laboratory Usage</label>
            <textarea
              required
              rows={2}
              placeholder="Explain project work, experiment title, or equipment needed (e.g. 3D printing custom drone arm)"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Duration & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Requested Duration (Minutes)
              </label>
              <input
                type="number"
                min={currentLab.operatingSchedule.minDurationMinutes}
                max={currentLab.operatingSchedule.maxDurationMinutes}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Lab limits: {currentLab.operatingSchedule.minDurationMinutes} to {currentLab.operatingSchedule.maxDurationMinutes}m
              </span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Date of Access</label>
              <input
                type="date"
                value={requestDate}
                onChange={e => setRequestDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Operating Days: {currentLab.operatingSchedule.operatingDays.join(', ')}
              </span>
            </div>
          </div>

          {/* Error & Ineligibility Feedback Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-2">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2 shrink-0 mt-0.5" />
                <div className="font-semibold">{errorMsg}</div>
              </div>

              {failureReasons.length > 0 && (
                <div className="pl-6 space-y-1">
                  <div className="font-semibold text-red-800 text-[11px] uppercase tracking-wide">
                    Reasons for Ineligibility:
                  </div>
                  <ul className="list-disc space-y-1 text-red-700 text-[11px]">
                    {failureReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {alternativeLabs.length > 0 && (
                <div className="pl-6 pt-2 border-t border-red-200/60">
                  <span className="font-semibold text-red-900 block text-[11px]">
                    Suggested Alternative Laboratories:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alternativeLabs.map(alt => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => setSelectedLabId(alt.id)}
                        className="px-2 py-0.5 bg-white border border-red-300 rounded text-[11px] font-medium text-red-800 hover:bg-red-100"
                      >
                        Switch to {alt.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex items-center space-x-1 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Validating & Allocating Token...</span>
              ) : (
                <>
                  <span>Submit & Receive Token</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
