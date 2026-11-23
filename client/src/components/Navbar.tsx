import React from 'react';
import { Compass, GraduationCap, ShieldAlert, Users, MessageSquareQuote, Layers, HelpCircle } from 'lucide-react';

interface Props {
  activeRole: 'student' | 'attendant' | 'visitor';
  onChangeRole: (role: 'student' | 'attendant' | 'visitor') => void;
  activeTab: 'explore' | 'my-tokens' | 'visitor';
  onChangeTab: (tab: 'explore' | 'my-tokens' | 'visitor') => void;
  onOpenAssistant: () => void;
  onOpenHelp: () => void;
  myTokenCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeRole,
  onChangeRole,
  activeTab,
  onChangeTab,
  onOpenAssistant,
  onOpenHelp,
  myTokenCount
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-gray-900">LabLink</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">College Laboratory Access System</p>
            </div>
          </div>

          {/* Navigation Items (for Student role) */}
          {activeRole === 'student' && (
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => onChangeTab('explore')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'explore'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Explore Laboratories</span>
              </button>

              <button
                onClick={() => onChangeTab('my-tokens')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === 'my-tokens'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>My Requests / Tokens</span>
                {myTokenCount > 0 && (
                  <span className="ml-1.5 px-2 py-0.2 bg-indigo-600 text-white text-xs font-bold rounded-full">
                    {myTokenCount}
                  </span>
                )}
              </button>

              <button
                onClick={onOpenAssistant}
                className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center space-x-1.5 border border-emerald-200"
              >
                <MessageSquareQuote className="w-4 h-4" />
                <span>Ask LabLink AI</span>
              </button>
            </nav>
          )}

          {/* Quick Tools & Role Switcher */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenHelp}
              title="Where to find your registration number"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
              <button
                onClick={() => onChangeRole('student')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  activeRole === 'student'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                onClick={() => onChangeRole('attendant')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  activeRole === 'attendant'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Attendant</span>
              </button>

              <button
                onClick={() => onChangeRole('visitor')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  activeRole === 'visitor'
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Visitor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
