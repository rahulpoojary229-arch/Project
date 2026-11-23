import { Laboratory, QueueStanding, QueueToken, VerificationResult, AttendantStats } from '../types';

const API_BASE = '/api';

export const api = {
  // Laboratories
  async getLabs(params?: { q?: string; department?: string; equipment?: string; facility?: string }): Promise<Laboratory[]> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.department) query.set('department', params.department);
    if (params?.equipment) query.set('equipment', params.equipment);
    if (params?.facility) query.set('facility', params.facility);

    const res = await fetch(`${API_BASE}/labs?${query.toString()}`);
    const data = await res.json();
    return data.laboratories || [];
  },

  async getLabById(id: string): Promise<Laboratory | null> {
    const res = await fetch(`${API_BASE}/labs/${id}`);
    const data = await res.json();
    return data.laboratory || null;
  },

  // Student verification & demo records
  async getDemoStudents(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/students/demo`);
    const data = await res.json();
    return data.students || [];
  },

  async verifyEligibility(registrationNumber: string, labId: string): Promise<VerificationResult> {
    const res = await fetch(`${API_BASE}/students/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationNumber, labId })
    });
    const data = await res.json();
    return data.result;
  },

  async getRegHelp(): Promise<any> {
    const res = await fetch(`${API_BASE}/students/help`);
    const data = await res.json();
    return data.help;
  },

  // Queue Operations
  async requestAccess(payload: {
    registrationNumber: string;
    labId: string;
    purpose: string;
    requestedDurationMinutes: number;
    requestDate?: string;
  }): Promise<{ success: boolean; token?: QueueToken; error?: string; reasons?: string[] }> {
    const res = await fetch(`${API_BASE}/queue/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getTokenStanding(tokenId: string): Promise<{
    standing: QueueStanding;
    laboratory: { id: string; name: string; location: string };
    serverTime: number;
    remainingCallSeconds: number | null;
  }> {
    const res = await fetch(`${API_BASE}/queue/token/${tokenId}`);
    return res.json();
  },

  async getStudentTokens(regNo: string): Promise<{
    token: QueueToken;
    standing: QueueStanding;
    labName: string;
  }[]> {
    const res = await fetch(`${API_BASE}/queue/student/${encodeURIComponent(regNo)}`);
    const data = await res.json();
    return data.tokens || [];
  },

  async cancelToken(tokenId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${API_BASE}/queue/token/${tokenId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  // Attendant Operations
  async getAttendantQueue(labId: string, date?: string): Promise<{
    laboratory: Laboratory;
    currentDate: string;
    serverTime: number;
    groups: {
      waiting: QueueToken[];
      called: (QueueToken & { remainingSeconds: number })[];
      arrived: QueueToken[];
      inUse: (QueueToken & { elapsedMinutes: number; isOverdue: boolean })[];
      completed: QueueToken[];
      expired: QueueToken[];
      cancelled: QueueToken[];
    };
  }> {
    const query = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/attendant/lab/${labId}/queue${query}`);
    return res.json();
  },

  async getAttendantStats(labId: string): Promise<AttendantStats> {
    const res = await fetch(`${API_BASE}/attendant/lab/${labId}/stats`);
    const data = await res.json();
    return data.stats;
  },

  async callNextStudent(tokenId: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const res = await fetch(`${API_BASE}/attendant/token/${tokenId}/call`, {
      method: 'POST'
    });
    return res.json();
  },

  async confirmArrival(tokenId: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const res = await fetch(`${API_BASE}/attendant/token/${tokenId}/arrived`, {
      method: 'POST'
    });
    return res.json();
  },

  async startSession(tokenId: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const res = await fetch(`${API_BASE}/attendant/token/${tokenId}/start-session`, {
      method: 'POST'
    });
    return res.json();
  },

  async endSession(tokenId: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const res = await fetch(`${API_BASE}/attendant/token/${tokenId}/end-session`, {
      method: 'POST'
    });
    return res.json();
  },

  async expireToken(tokenId: string, reason?: string): Promise<{ success: boolean; token?: QueueToken; error?: string }> {
    const res = await fetch(`${API_BASE}/attendant/token/${tokenId}/expire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  async closeOperatingDay(labId: string, currentDate?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/attendant/lab/${labId}/close-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentDate })
    });
    return res.json();
  },

  // Ask LabLink AI Assistant
  async askAssistant(question: string): Promise<{
    answer: string;
    sourceLabs?: string[];
    relevantTopics?: string[];
    suggestedQuestions?: string[];
  }> {
    const res = await fetch(`${API_BASE}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    return data.response;
  }
};
