import React, { useState, useEffect } from 'react';
import { Laboratory, QueueToken } from './types';
import { api } from './services/api';

import { Navbar } from './components/Navbar';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { LabDetailModal } from './components/LabDetailModal';
import { AccessRequestModal } from './components/AccessRequestModal';
import { AskLabLinkDrawer } from './components/AskLabLinkDrawer';
import { RegNoHelpModal } from './components/RegNoHelpModal';

import { StudentDashboard } from './pages/StudentDashboard';
import { AttendantDashboard } from './pages/AttendantDashboard';
import { ExternalVisitorPage } from './pages/ExternalVisitorPage';

export const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'student' | 'attendant' | 'visitor'>('student');
  const [activeTab, setActiveTab] = useState<'explore' | 'my-tokens' | 'visitor'>('explore');
  const [roleModalOpen, setRoleModalOpen] = useState(true);

  const [allLabs, setAllLabs] = useState<Laboratory[]>([]);
  const [selectedLabDetails, setSelectedLabDetails] = useState<Laboratory | null>(null);
  const [selectedLabAccess, setSelectedLabAccess] = useState<Laboratory | null>(null);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Store student's tokens locally for easy multi-token tracking in this demo
  const [myTokens, setMyTokens] = useState<QueueToken[]>(() => {
    try {
      const saved = localStorage.getItem('lablink_student_tokens');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    api.getLabs().then(setAllLabs).catch(console.error);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lablink_student_tokens', JSON.stringify(myTokens));
    } catch (e) {
      console.error(e);
    }
  }, [myTokens]);

  const handleRoleSelection = (role: 'student' | 'attendant' | 'visitor') => {
    setActiveRole(role);
    setRoleModalOpen(false);
    if (role === 'visitor') {
      setActiveTab('visitor');
    } else {
      setActiveTab('explore');
    }
  };

  const handleNewTokenReceived = (token: QueueToken) => {
    setMyTokens(prev => {
      const exists = prev.some(t => t.id === token.id);
      return exists ? prev : [token, ...prev];
    });
    setSelectedLabAccess(null);
    setActiveRole('student');
    setActiveTab('my-tokens');
  };

  const handleRefreshTokenList = () => {
    // Re-verify token statuses from server
    if (myTokens.length === 0) return;
    const updatePromises = myTokens.map(async t => {
      try {
        const res = await api.getTokenStanding(t.id);
        return res.standing.token;
      } catch {
        return t;
      }
    });
    Promise.all(updatePromises).then(updated => {
      setMyTokens(updated);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Role Selection Initial Modal */}
      <RoleSelectionModal
        isOpen={roleModalOpen}
        onSelectRole={handleRoleSelection}
      />

      {/* Navigation Header */}
      <Navbar
        activeRole={activeRole}
        onChangeRole={role => {
          setActiveRole(role);
          if (role === 'visitor') setActiveTab('visitor');
          else if (activeTab === 'visitor') setActiveTab('explore');
        }}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        myTokenCount={myTokens.filter(t => ['Waiting', 'Your turn', 'Arrived', 'In use'].includes(t.status)).length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === 'student' && (
          <StudentDashboard
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onSelectLabForDetails={setSelectedLabDetails}
            onSelectLabForAccess={setSelectedLabAccess}
            onOpenAssistant={() => setAssistantOpen(true)}
            userTokens={myTokens}
            onRefreshTokenList={handleRefreshTokenList}
          />
        )}

        {activeRole === 'attendant' && (
          <AttendantDashboard allLabs={allLabs} />
        )}

        {activeRole === 'visitor' && (
          <ExternalVisitorPage labs={allLabs} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-gray-600">
            LabLink • Making College Laboratories More Accessible
          </p>
          <p className="mt-1">
            Built for the PromptWars Challenge • FCFS Queue Engine • Single Branch • Zero Login
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LabDetailModal
        lab={selectedLabDetails}
        onClose={() => setSelectedLabDetails(null)}
        onRequestAccess={lab => {
          setSelectedLabDetails(null);
          setSelectedLabAccess(lab);
        }}
      />

      <AccessRequestModal
        lab={selectedLabAccess}
        allLabs={allLabs}
        onClose={() => setSelectedLabAccess(null)}
        onSuccess={handleNewTokenReceived}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <AskLabLinkDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />

      <RegNoHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  );
};
