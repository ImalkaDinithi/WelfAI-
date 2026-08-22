import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllApplications } from '../../api/adminApi';

const SRI_LANKAN_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Moneragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Appealed', label: 'Appealed' },
];

const ApplicationsOverview = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('All Districts');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (districtFilter && districtFilter !== 'All Districts') {
        params.district = districtFilter;
      }

      const res = await getAllApplications(params);
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load applications overview:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, districtFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Appealed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">
          All Applications Overview
        </h1>
        <p className="mt-2 text-sm text-teal-100 max-w-xl">
          Complete repository of submitted welfare scheme applications across all determination statuses. Filter by status or district to inspect history and appeal outcomes.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Dropdown */}
          <div>
            <label htmlFor="status-filter" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter Dropdown */}
          <div>
            <label htmlFor="district-filter" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Filter by District
            </label>
            <select
              id="district-filter"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All Districts">All Districts</option>
              {SRI_LANKAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button if active */}
          {(statusFilter !== 'ALL' || districtFilter !== 'All Districts') && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setDistrictFilter('All Districts');
              }}
              className="self-end rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium self-end">
          Total Applications: <span className="font-semibold text-slate-800">{applications.length}</span>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 animate-pulse">
          Loading application repository...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800 space-y-3">
          <p className="font-semibold">Error Loading Applications</p>
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchApplications}
            className="rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white hover:bg-red-900"
          >
            Retry Loading
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="text-4xl">🗂️</div>
          <h3 className="font-serif text-lg font-bold text-slate-900">
            No Applications Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No applications match the current filter selection criteria.
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
                  <th scope="col" className="px-6 py-4">District</th>
                  <th scope="col" className="px-6 py-4">Status & Modifiers</th>
                  <th scope="col" className="px-6 py-4">Submitted On</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const applicantName = app.personalInfo?.fullName || app.applicant?.fullName || 'N/A';
                  const applicantNic = app.personalInfo?.nicNumber || app.applicant?.nic || 'N/A';
                  const district = app.personalInfo?.district || app.applicant?.district || 'N/A';
                  const submittedDate = formatDate(app.submittedAt || app.createdAt);

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {applicantName}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        {applicantNic}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {district}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(app.status)}`}>
                            {app.status}
                          </span>

                          {app.hasAppeal && (
                            <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-800 shadow-2xs">
                              Via appeal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {submittedDate}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/review-queue/${app._id}`}
                          className="inline-flex items-center rounded-lg bg-teal-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800 shadow-sm"
                        >
                          View Details →
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

export default ApplicationsOverview;
