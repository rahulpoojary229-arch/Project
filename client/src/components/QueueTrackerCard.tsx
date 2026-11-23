import React, { useEffect, useState } from 'react';
import { QueueToken, QueueStanding } from '../types';
import { api } from '../services/api';
import { Clock, MapPin, AlertTriangle, CheckCircle2, XCircle, Timer, Users, Ban } from 'lucide-react';

interface Props {
  tokenId: string;
  onRefresh?: () => void;
  onCancel?: (tokenId: string) => void;
}

export const QueueTrackerCard: React.FC<Props> = ({ tokenId, onRefresh, onCancel }) => {
  const [data, setData] = useState<{
    standing: QueueStanding;
    laboratory: { id: string; name: string; location: string };
    serverTime: number;
    remainingCallSeconds: number | null;
  } | null>(null);

  const [localSecondsLeft, setLocalSecondsLeft] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Poll token standing every 3 seconds for lightweight real-time synchronization
  useEffect(() => {
    let isMounted = true;

    const fetchStanding = async () => {
      try {
        const res = await api.getTokenStanding(tokenId);
        if (isMounted && res.standing) {
          setData(res);
          setLocalSecondsLeft(res.remainingCallSeconds);
        }
      } catch (err) {
        console.error('Error fetching token standing:', err);
      }
    };

    fetchStanding();
    const interval = setInterval(fetchStanding, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [tokenId]);

  // Local tick for the 10-minute countdown
  useEffect(() => {
    if (localSecondsLeft === null || localSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setLocalSecondsLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [localSecondsLeft]);

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 animate-pulse text-xs text-gray-400">
        Loading token standing...
      </div>
    );
  }

  const { standing, laboratory } = data;
  const token = standing.token;

  const handleCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel Token ${token.tokenNumber}?`)) return;
    setCancelling(true);
    try {
      await api.cancelToken(token.id, 'Cancelled by student');
      if (onCancel) onCancel(token.id);
      if (onRefresh) onRefresh();
    } finally {
      setCancelling(false);
    }
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (token.status) {
      case 'Waiting':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600 animate-spin" /> Waiting in Queue
          </span>
        );
      case 'Your turn':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg flex items-center animate-pulse">
            <Timer className="w-3.5 h-3.5 mr-1 text-emerald-600" /> YOUR TURN NOW!
          </span>
        );
      case 'Arrived':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-lg flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" /> Arrival Confirmed
          </span>
        );
      case 'In use':
        return (
          <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-lg flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-purple-600" /> Session Active
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold rounded-lg flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-gray-600" /> Completed
          </span>
        );
      case 'Expired':
        return (
          <span className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 text-xs font-bold rounded-lg flex items-center">
            <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" /> Expired (No-Show)
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold rounded-lg flex items-center">
            <Ban className="w-3.5 h-3.5 mr-1 text-gray-400" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
      token.status === 'Your turn'
        ? 'border-emerald-400 ring-2 ring-emerald-200/50 bg-emerald-50/20'
        : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tight text-indigo-700 font-mono">
              {token.tokenNumber}
            </span>
            {token.isCarryover && (
              <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-bold rounded-full">
                Carried Over from {token.originalTokenNumber}
              </span>
            )}
          </div>
          <h4 className="font-bold text-gray-900 text-sm mt-0.5">{laboratory?.name || token.labId}</h4>
          <div className="flex items-center text-xs text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-400 mr-1" />
            <span>{laboratory?.location}</span>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* 10-Minute Countdown Notice when "Your turn" */}
      {token.status === 'Your turn' && localSecondsLeft !== null && (
        <div className="mt-4 p-4 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-100">
              10-Minute Reporting Window Active
            </div>
            <div className="text-xs text-emerald-50 mt-0.5">
              Please present yourself to the lab attendant and show your token.
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black font-mono tracking-wider">
              {formatCountdown(localSecondsLeft)}
            </div>
            <span className="text-[10px] text-emerald-100 block">Server-verified countdown</span>
          </div>
        </div>
      )}

      {/* Queue Standing Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs">
        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-gray-400 block text-[11px] font-medium">Queue Position</span>
          <span className="font-bold text-gray-800 text-sm">
            {standing.position > 0 ? `#${standing.position}` : '—'}
          </span>
        </div>

        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-gray-400 block text-[11px] font-medium">Students Ahead</span>
          <span className="font-bold text-gray-800 text-sm flex items-center">
            <Users className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {standing.studentsAhead}
          </span>
        </div>

        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-gray-400 block text-[11px] font-medium">Est. Wait Time</span>
          <span className="font-bold text-gray-800 text-sm flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {standing.estimatedWaitMinutes > 0 ? `~${standing.estimatedWaitMinutes} mins` : 'Immediate'}
          </span>
        </div>

        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <span className="text-gray-400 block text-[11px] font-medium">Requested Session</span>
          <span className="font-bold text-gray-800 text-sm">
            {token.requestedDurationMinutes} mins
          </span>
        </div>
      </div>

      {/* Details & Purpose */}
      <div className="mt-3.5 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="font-semibold text-gray-700">Student:</span> {token.studentName} ({token.studentRef})
          <span className="mx-2 text-gray-300">•</span>
          <span className="font-semibold text-gray-700">Purpose:</span> {token.purpose}
        </div>
        <div className="text-[11px] text-gray-400">
          Date: {token.requestDate}
        </div>
      </div>

      {/* Notes or cancellation reason if any */}
      {token.notes && (
        <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
          {token.notes}
        </div>
      )}

      {/* Actions */}
      {['Waiting', 'Your turn'].includes(token.status) && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Request'}
          </button>
        </div>
      )}
    </div>
  );
};
