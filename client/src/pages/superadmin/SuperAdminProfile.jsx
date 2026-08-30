import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser } from '../../api/authApi';

const SuperAdminProfile = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(authUser || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCurrentUser();
        if (res.success && res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch superadmin profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Superadmin Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/superadmin/dashboard')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 font-serif text-xl font-bold text-white shadow">
              W
            </div>
            <div>
              <span className="font-serif text-lg font-bold leading-tight text-white block">
                WelfAI
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-teal-400">
                Super Admin Intelligence & Strategy
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/superadmin/dashboard')}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-950/50 hover:border-red-900 transition"
            >
              <span>🚪 Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner */}
        <div className="rounded-2xl bg-linear-to-r from-teal-950 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600/30 border border-teal-400/30 text-2xl font-bold font-serif text-teal-200 shadow-inner">
              {getInitials(user?.fullName)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-2xl font-bold text-white">
                  {user?.fullName || 'Super Administrator'}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-teal-200 mt-0.5">
                Central Welfare Scheme Oversight & Strategic Intelligence Account
              </p>
            </div>
          </div>

          <div className="inline-flex items-center space-x-1.5 self-start sm:self-auto rounded-lg bg-amber-500/15 border border-amber-400/30 px-3 py-1.5 text-xs text-amber-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0 text-amber-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Informative notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="space-y-1">
            <p className="font-semibold">Central Administrative Account Security Policy</p>
            <p className="text-blue-800/90 leading-relaxed">
              This superadministrator account credentials and profile attributes are governed under national identity compliance protocols. Modifications to email address, security credentials, or authorization tier are restricted to central system governance.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
            Loading profile information...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account Details Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                <span>Account Profile Details</span>
                <span className="text-xs font-normal text-slate-500">Read-Only View</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-medium text-slate-500 block">Full Name</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.fullName || '—'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Verified</span>
                  </div>
                </div>

                {/* Email */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-medium text-slate-500 block">Email Address</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.email || '—'}
                    </span>
                    <span className="inline-flex items-center text-[10px] text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded font-medium">
                      🔒 Fixed
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-medium text-slate-500 block">Mobile Phone Number</span>
                  <div className="mt-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.phone || 'Not Provided'}
                    </span>
                  </div>
                </div>

                {/* NIC */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-medium text-slate-500 block">National Identity Card (NIC)</span>
                  <div className="mt-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.nic || '—'}
                    </span>
                  </div>
                </div>

                {/* District */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-medium text-slate-500 block">Assigned District / Jurisdiction</span>
                  <div className="mt-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.district || 'All Districts (National Level)'}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-medium text-slate-500 block">System Role</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                      {user?.role || 'superadmin'}
                    </span>
                    <span className="text-xs text-slate-500">Executive Tier</span>
                  </div>
                </div>

                {/* Account Status */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-medium text-slate-500 block">Account Status</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-semibold text-emerald-800">
                      {user?.isActive !== false ? 'Active & Operational' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="text-xs font-medium text-slate-500 block">Account Created On</span>
                  <div className="mt-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'System Initialized'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scope & Permissions Overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
                Operational Scope & Permissions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 space-y-1">
                  <span className="font-bold text-teal-900 block">📊 National Macro Analytics</span>
                  <p className="text-slate-600">
                    Full visibility into welfare applications across all 9 provinces and 25 districts.
                  </p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 space-y-1">
                  <span className="font-bold text-teal-900 block">⚖️ Strategic Resolution Oversight</span>
                  <p className="text-slate-600">
                    Real-time monitoring of appeal resolutions, reallocations, and waiting list prioritizations.
                  </p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 space-y-1">
                  <span className="font-bold text-teal-900 block">🤖 ML Predictive Strategy</span>
                  <p className="text-slate-600">
                    Tracking XGBoost gradient boost lifestyle success forecasts and benefit allocations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminProfile;
