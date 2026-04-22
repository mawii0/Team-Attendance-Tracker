import { useState, useEffect } from 'react';
import { History, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { 
  getUniqueDatesWithRecords, 
  getAttendanceForDate, 
  getTeamMembers,
  formatDisplayDate 
} from '../utils/storage';

export function HistoryView() {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const uniqueDates = getUniqueDatesWithRecords();
    setDates(uniqueDates);
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [selectedDate]);

  const teamMembers = getTeamMembers();
  const attendanceMap = selectedDate ? getAttendanceForDate(selectedDate) : new Map();

  const getAttendanceStats = (date: string) => {
    const attendance = getAttendanceForDate(date);
    const present = Array.from(attendance.values()).filter(p => p).length;
    const total = teamMembers.length; // Total team members, not just those with records
    return { present, total };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-7 h-7" />
            <h1 className="text-2xl font-semibold">Attendance History</h1>
          </div>
          <p className="text-indigo-100">View past attendance records</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {dates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Yet</h3>
            <p className="text-gray-500">Start tracking attendance to see history</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dates List */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recorded Dates</h2>
              <div className="space-y-2">
                {dates.map(date => {
                  const stats = getAttendanceStats(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        w-full text-left p-4 rounded-lg border transition-all
                        ${selectedDate === date 
                          ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                          : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {formatDisplayDate(date)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {stats.present} / {stats.total} present
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="text-xs font-medium text-indigo-600">
                            {Math.round((stats.present / stats.total) * 100)}%
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details for Selected Date */}
            {selectedDate && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Details</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-medium text-gray-900">{formatDisplayDate(selectedDate)}</h3>
                  </div>

                  {teamMembers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No team members found</p>
                  ) : (
                    <div className="space-y-3">
                      {teamMembers.map(member => {
                        const wasPresent = attendanceMap.get(member.id);
                        const hasRecord = attendanceMap.has(member.id);

                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                              style={{ backgroundColor: member.avatarColor }}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {member.name}
                              </p>
                            </div>
                            {!hasRecord ? (
                              <span className="text-xs text-gray-400 flex-shrink-0">No record</span>
                            ) : wasPresent ? (
                              <div className="flex items-center gap-1 text-green-600 flex-shrink-0">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Present</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                                <XCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Absent</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
