import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { ClipboardCheck, Users, History, Cloud, CloudOff } from 'lucide-react';
import { loadFromSupabase } from '../utils/storage';

export function RootLayout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [cloudConnected, setCloudConnected] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    async function initializeData() {
      const connected = await loadFromSupabase();
      setCloudConnected(connected);
      setIsLoading(false);
    }
    initializeData();
  }, []);

  const navItems = [
    { path: '/', icon: ClipboardCheck, label: 'Attendance' },
    { path: '/manage', icon: Users, label: 'Team' },
    { path: '/history', icon: History, label: 'History' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Cloud className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-600">Loading data from cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Team Tracker</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {cloudConnected ? (
                  <span className="inline-flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-green-600" />
                    <span>Cloud Synced</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <CloudOff className="w-3 h-3 text-amber-500" />
                    <span>Local Mode</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-indigo-100' : ''}`} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
