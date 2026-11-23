import React, { useState, useEffect } from 'react';
import { Laboratory, QueueToken } from '../types';
import { api } from '../services/api';
import { LabCard } from '../components/LabCard';
import { QueueTrackerCard } from '../components/QueueTrackerCard';
import { Search, Filter, Sparkles, AlertCircle, Wrench, Layers, Compass, CheckCircle2 } from 'lucide-react';

interface Props {
  activeTab: 'explore' | 'my-tokens' | 'visitor';
  onChangeTab: (tab: 'explore' | 'my-tokens' | 'visitor') => void;
  onSelectLabForDetails: (lab: Laboratory) => void;
  onSelectLabForAccess: (lab: Laboratory) => void;
  onOpenAssistant: () => void;
  userTokens: QueueToken[];
  onRefreshTokenList: () => void;
}

export const StudentDashboard: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  onSelectLabForDetails,
  onSelectLabForAccess,
  onOpenAssistant,
  userTokens,
  onRefreshTokenList
}) => {
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLabs = async () => {
      try {
        const data = await api.getLabs();
        setLabs(data);
      } catch (err) {
        console.error('Failed to load labs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLabs();
  }, []);

  const departments = ['All', ...new Set(labs.map(l => l.department))];

  // Equipment quick search suggestions
  const equipmentShortcuts = ['3D printer', 'Oscilloscope', 'Robot Arm', 'NVIDIA GPU', 'Soldering Station'];

  const filteredLabs = labs.filter(lab => {
    const matchesDept = selectedDepartment === 'All' || lab.department === selectedDepartment;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      lab.name.toLowerCase().includes(q) ||
      lab.department.toLowerCase().includes(q) ||
      lab.description.toLowerCase().includes(q) ||
      lab.building.toLowerCase().includes(q) ||
      lab.roomNumber.toLowerCase().includes(q) ||
      lab.equipment.some(e => e.toLowerCase().includes(q)) ||
      lab.facilities.some(f => f.toLowerCase().includes(q));

    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-700/50 rounded-full text-indigo-200 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart College Laboratory Access • Open Demo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discover labs, check eligibility & join live queues.
          </h1>
          <p className="text-sm text-indigo-200 mt-2 leading-relaxed">
            Instant transparent queueing without paper logbooks. Search equipment across college departments, check required permissions, and track your tokens in real-time.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onChangeTab('explore')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'bg-indigo-800/80 text-white hover:bg-indigo-700'
              }`}
            >
              Browse Laboratories
            </button>
            <button
              onClick={() => onChangeTab('my-tokens')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'my-tokens'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'bg-indigo-800/80 text-white hover:bg-indigo-700'
              }`}
            >
              <span>My Active Tokens</span>
              {userTokens.length > 0 && (
                <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] rounded-full">
                  {userTokens.length}
                </span>
              )}
            </button>
            <button
              onClick={onOpenAssistant}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask LabLink AI</span>
            </button>
          </div>
        </div>

        {/* Decorative corner element */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* VIEW 1: EXPLORE LABORATORIES */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search labs, departments, or equipment (e.g. '3D printer', 'oscilloscope')..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Department Filter */}
              <div className="flex items-center space-x-2 shrink-0">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className="p-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {departments.map((dept, i) => (
                    <option key={i} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Equipment Search Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] font-semibold text-gray-400 flex items-center mr-1">
                <Wrench className="w-3 h-3 mr-1" /> Quick Equipment Search:
              </span>
              {equipmentShortcuts.map((eq, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(eq)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    searchQuery.toLowerCase() === eq.toLowerCase()
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {eq}
                </button>
              ))}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-red-600 hover:underline font-semibold ml-2"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Available Laboratories ({filteredLabs.length})</span>
              </h2>
              <span className="text-xs text-gray-500">
                Asia/Kolkata Operating Time
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredLabs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-gray-700 text-sm">No laboratories matched your search</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Try searching for general terms like &quot;3D printer&quot;, &quot;Electronics&quot;, or clear the department filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('All');
                  }}
                  className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredLabs.map(lab => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    onViewDetails={onSelectLabForDetails}
                    onRequestAccess={onSelectLabForAccess}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MY REQUESTS & TOKENS */}
      {activeTab === 'my-tokens' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">My Laboratory Queue Tokens</h2>
              <p className="text-xs text-gray-500">
                Real-time queue standings, 10-minute reporting countdowns, and session tracking.
              </p>
            </div>
            <button
              onClick={onRefreshTokenList}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 border border-indigo-200 rounded-lg bg-indigo-50/50"
            >
              Refresh Tokens
            </button>
          </div>

          {userTokens.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs">
              <Compass className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">You don't have any active tokens yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
                Explore our college laboratories, check prerequisites, and click &quot;Request Access&quot; to join the smart first-come, first-served queue!
              </p>
              <button
                onClick={() => onChangeTab('explore')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-xs"
              >
                Explore Laboratories Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userTokens.map(token => (
                <QueueTrackerCard
                  key={token.id}
                  tokenId={token.id}
                  onRefresh={onRefreshTokenList}
                  onCancel={onRefreshTokenList}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
