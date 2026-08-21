import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingApplications } from '../../api/adminApi';

const SRI_LANKAN_DISTRICTS = [
  'All Districts',
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Moneragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya'
];

const ReviewQueue = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      if (selectedDistrict !== 'All Districts') {
        params.district = selectedDistrict;
      }
      const res = await getPendingApplications(params);
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin review queue:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedStatus, selectedDistrict]);

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
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">
          Application Review Queue
        </h1>
        <p className="mt-2 text-sm text-teal-100 max-w-xl">
          Review pending welfare scheme applications, verify submitted documents, and view past approval or rejection determinations.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-2">
            Status Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Applications' },
            { id: 'Submitted', label: 'Submitted' },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedStatus === tab.id
                  ? 'bg-teal-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="district-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            District:
          </label>
          <select
            id="district-filter"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm focus:border-teal-800 focus:outline-none"
          >
            {SRI_LANKAN_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 animate-pulse">
          Loading applications...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800 space-y-3">
          <p className="font-semibold">Error Loading Applications</p>
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchQueue}
            className="rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white hover:bg-red-900"
          >
            Retry Loading Queue
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="text-4xl">📥</div>
          <h3 className="font-serif text-lg font-bold text-slate-900">
            No Applications Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no applications matching your selected filters ({selectedStatus !== 'ALL' ? selectedStatus : 'All Statuses'}{selectedDistrict !== 'All Districts' ? `, ${selectedDistrict}` : ''}).
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
                  <th scope="col" className="px-6 py-4">Submitted On</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const applicantName = app.personalInfo?.fullName || app.applicant?.fullName || 'N/A';
                  const applicantNic = app.personalInfo?.nicNumber || app.applicant?.nic || 'N/A';
                  const district = app.personalInfo?.district || app.applicant?.district || 'N/A';
                  const isDecided = app.status === 'Approved' || app.status === 'Rejected';

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {applicantName}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        {applicantNic}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {district}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(app.submittedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/review-queue/${app._id}`}
                          className={`inline-flex items-center rounded-lg px-3.5 py-1.5 text-xs font-semibold transition shadow-sm ${
                            isDecided
                              ? 'bg-slate-700 text-white hover:bg-slate-800'
                              : 'bg-teal-900 text-white hover:bg-teal-800'
                          }`}
                        >
                          {isDecided ? 'View Details →' : 'Review →'}
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

export default ReviewQueue;
