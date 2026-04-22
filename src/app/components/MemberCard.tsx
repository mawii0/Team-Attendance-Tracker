import { User } from 'lucide-react';
import { TeamMember } from '../utils/storage';

interface MemberCardProps {
  member: TeamMember;
  present: boolean;
  onToggle: () => void;
}

export function MemberCard({ member, present, onToggle }: MemberCardProps) {
  return (
    <div 
      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      onClick={onToggle}
    >
      {/* Avatar */}
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: member.avatarColor }}
      >
        <User className="w-6 h-6 text-white" />
      </div>
      
      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{member.name}</p>
      </div>
      
      {/* Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`
          w-20 h-10 rounded-full relative transition-colors duration-200 flex-shrink-0
          ${present ? 'bg-green-500' : 'bg-gray-300'}
        `}
        aria-label={`Mark ${member.name} as ${present ? 'absent' : 'present'}`}
      >
        <div 
          className={`
            absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-200
            ${present ? 'translate-x-10' : 'translate-x-1'}
          `}
        />
        <span className={`
          absolute inset-0 flex items-center justify-center text-xs font-medium text-white
          ${present ? 'pr-6' : 'pl-6'}
        `}>
          {present ? 'Yes' : 'No'}
        </span>
      </button>
    </div>
  );
}
