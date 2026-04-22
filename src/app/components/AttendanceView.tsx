import { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2 } from 'lucide-react';
import { MemberCard } from './MemberCard';
import { 
  getTeamMembers, 
  getAttendanceForDate, 
  saveAttendanceForDate, 
  formatDate,
  formatDisplayDate 
} from '../utils/storage';
import { toast } from 'sonner';

export function AttendanceView() {
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [attendance, setAttendance] = useState<Map<string, boolean>>(new Map());
  const [teamMembers, setTeamMembers] = useState(getTeamMembers());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load attendance for selected date
  useEffect(() => {
    const savedAttendance = getAttendanceForDate(selectedDate);
    setAttendance(savedAttendance);
  }, [selectedDate]);

  // Refresh team members when view gains focus
  useEffect(() => {
    const handleFocus = () => {
      setTeamMembers(getTeamMembers());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Refresh team members on mount and when navigating back
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamMembers(getTeamMembers());
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggle = (memberId: string) => {
    setAttendance(prev => {
      const newAttendance = new Map(prev);
      newAttendance.set(memberId, !prev.get(memberId));
      return newAttendance;
    });
  };

  const handleSave = () => {
    saveAttendanceForDate(selectedDate, attendance);
    toast.success('Attendance saved successfully!', {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setShowDatePicker(false);
  };

  const isToday = selectedDate === formatDate(new Date());

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Date Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6" />
            <h2 className="text-lg font-medium">Attendance Date</h2>
          </div>
          
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-2xl font-semibold bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg hover:bg-white/20 transition-colors w-full text-left"
          >
            {formatDisplayDate(selectedDate)}
          </button>
          
          {showDatePicker && (
            <div className="mt-4">
              <p className="text-sm text-indigo-100 mb-2">
                Select any date to add or edit attendance
              </p>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={formatDate(new Date())}
                className="w-full px-4 py-3 rounded-lg text-gray-900 font-medium"
              />
            </div>
          )}
          
          {!isToday && (
            <button
              onClick={() => setSelectedDate(formatDate(new Date()))}
              className="mt-3 text-sm text-indigo-100 hover:text-white underline"
            >
              Jump to Today
            </button>
          )}
        </div>
      </div>

      {/* Team Members List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
            <p className="text-gray-500 mb-6">Add team members to start tracking attendance</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                {teamMembers.length} {teamMembers.length === 1 ? 'Member' : 'Members'}
              </h3>
              <div className="text-sm text-gray-500">
                Present: {Array.from(attendance.values()).filter(p => p).length} / {teamMembers.length}
              </div>
            </div>
            
            <div className="space-y-3">
              {teamMembers.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  present={attendance.get(member.id) || false}
                  onToggle={() => handleToggle(member.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      {teamMembers.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Attendance
          </button>
        </div>
      )}
    </div>
  );
}
