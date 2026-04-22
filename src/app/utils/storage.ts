import { projectId, publicAnonKey } from '/utils/supabase/info';

const envProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID?.trim();
const envPublicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const resolvedProjectId = envProjectId || projectId;
const resolvedPublicAnonKey = envPublicAnonKey || publicAnonKey;

// Data types
export interface TeamMember {
  id: string;
  name: string;
  avatarColor: string;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD format
  memberId: string;
  present: boolean;
}

// Storage keys
const TEAM_MEMBERS_KEY = 'team_members';
const ATTENDANCE_RECORDS_KEY = 'attendance_records';

// Supabase API base URL
const API_BASE = `https://${resolvedProjectId}.supabase.co/functions/v1/make-server-06a79272`;

// Track cloud connection status
let cloudAvailable = false;

// Check if cloud is available
async function checkCloudAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${resolvedPublicAnonKey}` },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Sync data to Supabase (silently fails if cloud unavailable)
async function syncToSupabase(type: 'team' | 'attendance' | 'all'): Promise<void> {
  if (!cloudAvailable) {
    // Skip sync if cloud is not available
    return;
  }

  try {
    if (type === 'all') {
      const teamMembers = getTeamMembers();
      const attendanceRecords = getAttendanceRecords();
      const response = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resolvedPublicAnonKey}`,
        },
        body: JSON.stringify({ teamMembers, attendanceRecords }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Sync failed');
    } else if (type === 'team') {
      const teamMembers = getTeamMembers();
      const response = await fetch(`${API_BASE}/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resolvedPublicAnonKey}`,
        },
        body: JSON.stringify(teamMembers),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Team sync failed');
    } else if (type === 'attendance') {
      const attendanceRecords = getAttendanceRecords();
      const response = await fetch(`${API_BASE}/attendance-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resolvedPublicAnonKey}`,
        },
        body: JSON.stringify(attendanceRecords),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Attendance sync failed');
    }
  } catch (error) {
    console.warn('Cloud sync skipped (offline mode):', error);
    cloudAvailable = false; // Mark as unavailable for subsequent calls
  }
}

// Load data from Supabase (returns true if successful)
export async function loadFromSupabase(): Promise<boolean> {
  try {
    // First check if cloud is available
    cloudAvailable = await checkCloudAvailability();

    if (!cloudAvailable) {
      console.log('Cloud storage unavailable - using local storage only');
      return false;
    }

    const [teamResponse, attendanceResponse] = await Promise.all([
      fetch(`${API_BASE}/team-members`, {
        headers: { 'Authorization': `Bearer ${resolvedPublicAnonKey}` },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${API_BASE}/attendance-records`, {
        headers: { 'Authorization': `Bearer ${resolvedPublicAnonKey}` },
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    if (teamResponse.ok) {
      const teamMembers = await teamResponse.json();
      if (teamMembers && teamMembers.length > 0) {
        localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(teamMembers));
      }
    }

    if (attendanceResponse.ok) {
      const attendanceRecords = await attendanceResponse.json();
      if (attendanceRecords && attendanceRecords.length > 0) {
        localStorage.setItem(ATTENDANCE_RECORDS_KEY, JSON.stringify(attendanceRecords));
      }
    }

    console.log('Data loaded from cloud storage successfully');
    return true;
  } catch (error) {
    console.warn('Cloud storage unavailable - using local storage only');
    cloudAvailable = false;
    return false;
  }
}

// Get cloud connection status
export function isCloudConnected(): boolean {
  return cloudAvailable;
}

// Team Members
export function getTeamMembers(): TeamMember[] {
  const data = localStorage.getItem(TEAM_MEMBERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTeamMembers(members: TeamMember[]): void {
  localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
  syncToSupabase('team');
}

export function addTeamMember(name: string): TeamMember {
  const members = getTeamMembers();
  const colors = ['#6366f1', '#14b8a6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  const newMember: TeamMember = {
    id: Date.now().toString(),
    name: name.trim(),
    avatarColor: colors[Math.floor(Math.random() * colors.length)]
  };
  members.push(newMember);
  saveTeamMembers(members);
  return newMember;
}

export function removeTeamMember(id: string): void {
  const members = getTeamMembers().filter(m => m.id !== id);
  saveTeamMembers(members);
  
  // Also remove all attendance records for this member
  const records = getAttendanceRecords().filter(r => r.memberId !== id);
  saveAttendanceRecords(records);
}

// Attendance Records
export function getAttendanceRecords(): AttendanceRecord[] {
  const data = localStorage.getItem(ATTENDANCE_RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(ATTENDANCE_RECORDS_KEY, JSON.stringify(records));
  syncToSupabase('attendance');
}

export function getAttendanceForDate(date: string): Map<string, boolean> {
  const records = getAttendanceRecords();
  const dateRecords = records.filter(r => r.date === date);
  const attendanceMap = new Map<string, boolean>();
  dateRecords.forEach(r => attendanceMap.set(r.memberId, r.present));
  return attendanceMap;
}

export function saveAttendanceForDate(date: string, attendance: Map<string, boolean>): void {
  let records = getAttendanceRecords();
  
  // Remove existing records for this date
  records = records.filter(r => r.date !== date);
  
  // Add new records
  attendance.forEach((present, memberId) => {
    records.push({ date, memberId, present });
  });
  
  saveAttendanceRecords(records);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const todayStr = formatDate(today);
  
  if (dateStr === todayStr) {
    return 'Today';
  }
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

export function getUniqueDatesWithRecords(): string[] {
  const records = getAttendanceRecords();
  const dates = new Set(records.map(r => r.date));
  return Array.from(dates).sort().reverse(); // Most recent first
}
