import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyApplication } from '../../api/applicationApi';

const DashboardHome = () => {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await getMyApplication();
        if (res.success && res.data) {
          setApplication(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard application data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Draft':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">
          Welcome back, {user?.fullName || 'Applicant'}!
        </h1>
        <p className="mt-2 text-sm text-teal-100 max-w-xl">
          Manage your Sri Lanka Welfare Scheme application, track verification progress, and view recommendations.
        </p>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Application Status
            </h2>
            {loading ? (
              <span className="text-xs text-slate-400">Loading...</span>
            ) : (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                  application?.status || 'No Application'
                )}`}
              >
                {application?.status || 'Not Started'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400 animate-pulse">
              Checking application status...
            </div>
          ) : !application || application.status === 'Draft' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                {application
                  ? 'You have an unsubmitted draft application in progress.'
                  : 'You have not submitted a welfare application yet.'}
              </p>
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
                <span className="text-xs font-semibold text-amber-800 block mb-1">
                  Action Required
                </span>
                <p className="text-xs text-amber-700">
                  Complete all 9 data sections and upload mandatory documents to submit your application for eligibility review.
                </p>
              </div>

              <div>
                <Link
                  to="/application/new"
                  className="inline-flex items-center rounded-lg bg-teal-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 shadow-sm"
                >
                  {application ? 'Continue Draft Application →' : 'Start Welfare Application →'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Your application has been submitted and is currently being processed by the system.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Submitted On</span>
                  <span className="font-semibold text-slate-800">
                    {application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString('en-LK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Application Reference ID</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {application._id}
                  </span>
                </div>
              </div>

              <div>
                <Link
                  to="/dashboard/application"
                  className="inline-flex items-center rounded-lg border border-teal-800 bg-white px-5 py-2.5 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
                >
                  View Submitted Application Details
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Info Sidebar Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-slate-900">
            Account Overview
          </h3>
          <div className="space-y-3 text-xs">
            <div className="py-2 border-b border-slate-100 flex justify-between">
              <span className="text-slate-500">Applicant Name:</span>
              <span className="font-semibold text-slate-800">{user?.fullName}</span>
            </div>
            <div className="py-2 border-b border-slate-100 flex justify-between">
              <span className="text-slate-500">NIC Number:</span>
              <span className="font-semibold text-slate-800">{user?.nic || 'N/A'}</span>
            </div>
            <div className="py-2 border-b border-slate-100 flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">District:</span>
              <span className="font-semibold text-slate-800">{user?.district || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
