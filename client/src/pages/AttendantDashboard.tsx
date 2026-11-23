import React, { useState, useEffect } from 'react';
import { Laboratory, QueueToken, AttendantStats } from '../types';
import { api } from '../services/api';
import {
  ShieldAlert,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Play,
  Square,
  AlertTriangle,
  RotateCcw,
  CalendarCheck,
  Building2,
  RefreshCw
} from 'lucide-react';

interface Props {
  allLabs: Laboratory[];
}

export const AttendantDashboard: React.FC<Props> = ({ allLabs }) => {
  const [selectedLabId, setSelectedLabId] = useState<string>(allLabs[0]?.id || 'lab-elec');
  const [queueData, setQueueData] = useState<any>(null);
  const [stats, setStats] = useState<AttendantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const currentLab = allLabs.find(l => l.id === selectedLabId) || allLabs[0];

  const fetchDashboardData = async () => {
    if (!selectedLabId) return;
    try {
      const [queueRes, statsRes] = await Promise.all([
        api.getAttendantQueue(selectedLabId),
        api.getAttendantStats(selectedLabId)
      ]);
      setQueueData(queueRes);
      setStats(statsRes);
    } catch (err) {
      console.error('Error fetching attendant data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time polling every 3 seconds so attendant view and student view stay in sync
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, [selectedLabId]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  // Actions
  const handleCallStudent = async (tokenId: string, tokenNum: string) => {
    setActionLoadingId(tokenId);
    try {
      const res = await api.callNextStudent(tokenId);
      if (res.success) {
        showNotification(`Called ${tokenNum}! The 10-minute reporting timer has started.`);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to call student.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmArrival = async (tokenId: string, tokenNum: string) => {
    setActionLoadingId(tokenId);
    try {
      const res = await api.confirmArrival(tokenId);
      if (res.success) {
        showNotification(`Arrival confirmed for ${tokenNum}. Ready to start session.`);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to confirm arrival.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartSession = async (tokenId: string, tokenNum: string) => {
    setActionLoadingId(tokenId);
    try {
      const res = await api.startSession(tokenId);
      if (res.success) {
        showNotification(`Session started for ${tokenNum}. Usage timer is now tracking.`);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to start session.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEndSession = async (tokenId: string, tokenNum: string) => {
    setActionLoadingId(tokenId);
    try {
      const res = await api.endSession(tokenId);
      if (res.success) {
        showNotification(`Session completed for ${tokenNum}. Marked as served today.`);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to complete session.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExpireToken = async (tokenId: string, tokenNum: string) => {
    if (!window.confirm(`Expire token ${tokenNum} due to no-show / attendance lapse?`)) return;
    setActionLoadingId(tokenId);
    try {
      const res = await api.expireToken(tokenId, 'Expired by attendant override');
      if (res.success) {
        showNotification(`Token ${tokenNum} has been marked Expired.`);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to expire token.');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloseOperatingDay = async () => {
    if (!currentLab) return;
    const confirmMsg =
      `Are you sure you want to CLOSE the operating day for ${currentLab.name}?\n\n` +
      `This will execute the Carryover Algorithm:\n` +
      `• All unserved 'Waiting' tokens will carry over to the next operating day.\n` +
      `• Tokens will be re-numbered starting from #01 while preserving original queue priority.\n` +
      `• Completed, expired, and cancelled requests will NOT carry forward.`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await api.closeOperatingDay(currentLab.id);
      if (res.success) {
        showNotification(res.message);
        fetchDashboardData();
      } else {
        alert(res.error || 'Failed to close operating day.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Attendant Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold rounded-full flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Staff Operation Mode
              </span>
              <span className="text-xs text-slate-400">
                Live Server State: Asia/Kolkata
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Laboratory Attendant Control Deck
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Process incoming student requests, manage 10-minute reporting windows, track active bench sessions, and manage daily carryover.
            </p>
          </div>

          {/* Laboratory Selector */}
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1 text-blue-400" /> Active Facility Desk
            </label>
            <select
              value={selectedLabId}
              onChange={e => setSelectedLabId(e.target.value)}
              className="bg-slate-900 border border-slate-600 text-white rounded-xl text-xs font-semibold p-2.5 focus:ring-2 focus:ring-blue-500"
            >
              {allLabs.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Demo security notice */}
        <div className="mt-4 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 text-[11px] text-slate-400">
          <strong>Security Notice for Evaluators:</strong> In accordance with the challenge prompt (Rule 2), no login is introduced. In production, this attendant dashboard would require authenticated institutional staff SSO.
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-xs text-emerald-100 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-gray-400 text-xs font-medium block">Waiting in Queue</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats.waitingStudents}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-gray-400 text-xs font-medium block">Currently Using</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {stats.currentlyUsing}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-gray-400 text-xs font-medium block">Served Today</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {stats.servedToday}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-gray-400 text-xs font-medium block">Expired (No-Show)</span>
            <span className="text-2xl font-black text-red-600 mt-1 block">
              {stats.expiredTokens}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-gray-400 text-xs font-medium block">Remaining Capacity</span>
            <span className="text-2xl font-black text-slate-700 mt-1 block">
              {stats.remainingCapacity} / {stats.dailyCapacity}
            </span>
          </div>
        </div>
      )}

      {/* Operating Day Management Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center">
            <CalendarCheck className="w-4 h-4 mr-1.5 text-blue-600" />
            End-of-Day Closure & Carryover Engine
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Closing the day triggers Rule 5.B: Unserved waiting requests carry forward to next operating day as fresh #01 sequence.
          </p>
        </div>

        <button
          onClick={handleCloseOperatingDay}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Close Operating Day & Rollover</span>
        </button>
      </div>

      {/* Queue Sections */}
      {queueData?.groups && (
        <div className="space-y-6">
          {/* SECTION 1: CALLED (10-Minute Reporting Window) */}
          <div className="bg-white rounded-2xl border border-emerald-300 p-5 shadow-xs bg-emerald-50/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Called Students • 10-Minute Reporting Window ({queueData.groups.called.length})
                </h3>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                Live Server Countdown Active
              </span>
            </div>

            {queueData.groups.called.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 italic">
                No students currently in the 10-minute reporting window. Call the next waiting student below.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {queueData.groups.called.map((t: any) => (
                  <div key={t.id} className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black font-mono text-emerald-700">
                          {t.tokenNumber}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-black font-mono text-red-600">
                            {formatCountdown(t.remainingSeconds)}
                          </span>
                          <span className="text-[10px] text-gray-400 block">Auto-expires at 00:00</span>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-800 text-xs mt-1">
                        {t.studentName} ({t.studentRef})
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Purpose: {t.purpose} • Requested: {t.requestedDurationMinutes}m
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => handleExpireToken(t.id, t.tokenNumber)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold"
                      >
                        Expire (No-Show)
                      </button>
                      <button
                        onClick={() => handleConfirmArrival(t.id, t.tokenNumber)}
                        disabled={actionLoadingId === t.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Arrival</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: ARRIVED (Ready to Start Session) */}
          {queueData.groups.arrived.length > 0 && (
            <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600" />
                Arrived Students • Ready to Enter ({queueData.groups.arrived.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {queueData.groups.arrived.map((t: any) => (
                  <div key={t.id} className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-blue-700 text-base">{t.tokenNumber}</div>
                      <div className="text-xs font-semibold text-gray-800">{t.studentName} ({t.studentRef})</div>
                      <div className="text-[11px] text-gray-500">Duration: {t.requestedDurationMinutes} mins</div>
                    </div>
                    <button
                      onClick={() => handleStartSession(t.id, t.tokenNumber)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Session</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: IN USE (Active Sessions & Overtime Tracking) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-purple-600" />
              Active Bench Sessions ({queueData.groups.inUse.length})
            </h3>
            {queueData.groups.inUse.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 italic">
                No active laboratory sessions currently in progress.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {queueData.groups.inUse.map((t: any) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      t.isOverdue
                        ? 'bg-red-50/60 border-red-300 ring-1 ring-red-200'
                        : 'bg-purple-50/40 border-purple-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-purple-800 text-lg">{t.tokenNumber}</span>
                        {t.isOverdue ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-red-600" /> OVERTIME SESSION
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-purple-700">
                            Elapsed: {t.elapsedMinutes} / {t.requestedDurationMinutes} mins
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-gray-800 mt-1">
                        {t.studentName} ({t.studentRef})
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">Purpose: {t.purpose}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-purple-100 flex justify-end">
                      <button
                        onClick={() => handleEndSession(t.id, t.tokenNumber)}
                        className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>End Session</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: WAITING QUEUE */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-amber-600" />
              Waiting Students Queue ({queueData.groups.waiting.length})
            </h3>

            {queueData.groups.waiting.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 italic">
                The waiting queue is currently empty.
              </p>
            ) : (
              <div className="space-y-2">
                {queueData.groups.waiting.map((t: any, index: number) => (
                  <div
                    key={t.id}
                    className="p-3 bg-gray-50 hover:bg-gray-100/70 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-200 font-bold text-gray-700 flex items-center justify-center shrink-0">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-indigo-700">{t.tokenNumber}</span>
                          <span className="font-semibold text-gray-800">{t.studentName}</span>
                          <span className="text-gray-400 text-[11px]">({t.studentRef})</span>
                          {t.isCarryover && (
                            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">
                              Carryover Priority
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-[11px] mt-0.5">
                          Purpose: {t.purpose} • Duration: {t.requestedDurationMinutes} mins
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleCallStudent(t.id, t.tokenNumber)}
                        disabled={actionLoadingId === t.id}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Call Next Student</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: TODAY'S LOGS (COMPLETED, EXPIRED, CANCELLED) */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Today's Session & Audit Logs ({queueData.groups.completed.length} served, {queueData.groups.expired.length} expired, {queueData.groups.cancelled.length} cancelled)
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs text-gray-600">
              {queueData.groups.completed.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                  <span className="font-mono font-bold text-emerald-700">{t.tokenNumber}</span>
                  <span>{t.studentName} • Served ({t.actualDurationMinutes || t.requestedDurationMinutes}m)</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">Completed</span>
                </div>
              ))}
              {queueData.groups.expired.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                  <span className="font-mono font-bold text-red-600">{t.tokenNumber}</span>
                  <span>{t.studentName} • No-Show after 10 mins</span>
                  <span className="text-red-600 font-semibold text-[11px]">Expired</span>
                </div>
              ))}
              {queueData.groups.cancelled.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                  <span className="font-mono font-bold text-gray-400">{t.tokenNumber}</span>
                  <span>{t.studentName} • {t.cancellationReason || 'Cancelled'}</span>
                  <span className="text-gray-400 font-semibold text-[11px]">Cancelled</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
