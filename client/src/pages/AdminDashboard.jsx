import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin/review-queue', label: 'Review Queue', icon: '📋', end: false },
  { path: '/admin/profile', label: 'My Profile', icon: '👤', end: false },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 bg-slate-900 text-slate-300 md:flex md:flex-col justify-between p-6">
        <div>
          {/* Brand */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 font-serif text-xl font-bold text-white shadow">
              W
            </div>
            <div>
              <span className="font-serif text-lg font-bold text-white block leading-tight">
                WelfAI
              </span>
              <span className="text-[10px] text-teal-400 tracking-wider uppercase font-semibold">
                Admin Portal
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal-900 text-white font-semibold shadow-inner'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="px-2">
            <span className="block text-xs font-semibold text-white truncate">
              {user?.fullName}
            </span>
            <span className="block text-[11px] text-slate-400 truncate">
              {user?.email} ({user?.role})
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-950/40 hover:text-red-300"
          >
            <span>🚪 Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Top Navbar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white md:hidden">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 font-serif font-bold text-sm">
              W
            </div>
            <span className="font-serif font-bold text-base">WelfAI Admin</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:bg-slate-800 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <nav className="border-b border-slate-800 bg-slate-900 p-4 space-y-1 md:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal-900 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center space-x-2 rounded-lg bg-red-950/60 px-4 py-2 text-xs font-semibold text-red-300"
            >
              <span>Logout</span>
            </button>
          </nav>
        )}

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
