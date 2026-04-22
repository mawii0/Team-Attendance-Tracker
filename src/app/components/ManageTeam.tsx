import { useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { getTeamMembers, addTeamMember, removeTeamMember, TeamMember } from '../utils/storage';
import { toast } from 'sonner';

export function ManageTeam() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(getTeamMembers());
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const member = addTeamMember(newMemberName);
    setTeamMembers(getTeamMembers());
    setNewMemberName('');
    toast.success(`${member.name} added to team`);
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (window.confirm(`Remove ${name} from the team? This will also delete all their attendance records.`)) {
      removeTeamMember(id);
      setTeamMembers(getTeamMembers());
      toast.success(`${name} removed from team`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-6 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-7 h-7" />
            <h1 className="text-2xl font-semibold">Manage Team</h1>
          </div>
          <p className="text-teal-100">Add or remove team members</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Add Member Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Member</h2>
          <form onSubmit={handleAddMember} className="flex gap-3">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Enter member name"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors flex-shrink-0"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden xs:inline sm:inline">Add</span>
            </button>
          </form>
        </div>

        {/* Team Members List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
            <span className="text-sm text-gray-500">
              {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members Yet</h3>
              <p className="text-gray-500">Add your first team member above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{member.name}</p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    aria-label={`Remove ${member.name}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}