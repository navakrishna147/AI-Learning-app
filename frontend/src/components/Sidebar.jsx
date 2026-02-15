import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/flashcards', icon: BookOpen, label: 'Flashcards' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 bottom-0 z-50 overflow-y-auto lg:sticky lg:h-screen will-change-transform" style={{ contain: 'layout style paint' }}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-br from-white to-gray-50 sticky top-0 z-10">
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">AI Learn</span>
            <span className="text-xs text-emerald-600 font-semibold block">Assistant</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
              {isActive && <div className="ml-auto w-1 h-6 bg-emerald-500 rounded-full"></div>}
            </Link>
          );
        })}
      </nav>

      {/* User Info Section */}
      {user && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-gradient-to-b from-white to-gray-50">
          <Link to="/profile" className="block mb-4">
            <div className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-lg transition-all duration-200">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-semibold text-xs">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.username || 'User'}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user.role || 'student'}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <button
          onClick={handleLogout}
          className="btn-secondary w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="whitespace-nowrap">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;