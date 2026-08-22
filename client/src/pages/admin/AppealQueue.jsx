import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAppealedApplications } from '../../api/adminApi';

const FILTER_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

const AppealQueue = () => {
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppeals = useCallback(async (filter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAppealedApplications(filter);
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load appeals queue:', err);
      setError(err.response?.data?.message || 'Failed to fetch appealed applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppeals(activeFilter);
  }, [activeFilter, fetchAppeals]);

  const handleFilterChange = (filterId) => {
    if (filterId !== activeFilter) {
      setActiveFilter(filterId);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAppealStatusBadge = (app) => {
    const decision = app.appeal?.decision;
    if (decision === 'Approved' || (app.status === 'Approved' && decision)) {
      return {
        label: 'Approved',
        className: 'border-emerald-200 bg-emerald-100 text-emerald-800',
      };
    }
    if (decision === 'Rejected' || (app.status === 'Rejected' && decision)) {
      return {
        label: 'Rejected',
        className: 'border-red-200 bg-red-100 text-red-800',
      };
    }
    return {
      label: 'Awaiting review',
      className: 'border-purple-200 bg-purple-100 text-purple-800',
    };
  };

  const getEmptyMessage = () => {
    switch (activeFilter) {
      case 'approved':
        return 'There are no approved appeals in the history records.';
      case 'rejected':
        return 'There are no rejected appeals in the history records.';
      case 'all':
        return 'No appeal records were found.';
      case 'active':
      default:
        return 'There are currently no pending appeals awaiting administrator determination.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">
          Appeals Review Queue
        </h1>
        <p className="mt-2 text-sm text-teal-100 max-w-xl">
          Review formal welfare eligibility determination appeals submitted by rejected applicants. Inspect submitted appeal evidence and issue determination rulings.
        </p>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-semibold text-slate-700">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleFilterChange(opt.id)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-white text-teal-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label} Appeals
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-800">{applications.length}</span> {activeFilter} record(s)
        </span>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 animate-pulse">
          Loading appeals queue...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800 space-y-3">
          <p className="font-semibold">Error Loading Appeals</p>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchAppeals(activeFilter)}
            className="rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white hover:bg-red-900"
          >
            Retry Loading Queue
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="text-4xl">⚖️</div>
          <h3 className="font-serif text-lg font-bold text-slate-900">
            No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Appeals
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {getEmptyMessage()}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4">Applicant Name</th>
                  <th scope="col" className="px-6 py-4">NIC Number</th>
                  <th scope="col" className="px-6 py-4">Grounds for Appeal</th>
                  <th scope="col" className="px-6 py-4">Original Rejection Date</th>
                  <th scope="col" className="px-6 py-4">
                    {activeFilter === 'active' ? 'Appeal Submitted On' : 'Decision / Appeal Date'}
                  </th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const applicantName = app.personalInfo?.fullName || app.applicant?.fullName || 'N/A';
                  const applicantNic = app.personalInfo?.nicNumber || app.applicant?.nic || 'N/A';
                  const grounds = app.appeal?.groundsForAppeal || 'N/A';
                  const rejectionDate = formatDate(app.reviewedAt || app.updatedAt);
                  const appealDate = formatDate(app.appeal?.reviewedAt || app.appeal?.submittedAt);
                  const statusBadge = getAppealStatusBadge(app);

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {applicantName}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        {applicantNic}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate" title={grounds}>
                        {grounds}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {rejectionDate}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {appealDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/appeal-queue/${app._id}`}
                          className="inline-flex items-center rounded-lg bg-teal-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800 shadow-sm"
                        >
                          {app.appeal?.decision ? 'View Determination →' : 'Review Appeal →'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealQueue;
