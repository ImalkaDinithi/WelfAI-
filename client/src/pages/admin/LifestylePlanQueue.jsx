import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPlansForReview } from '../../api/adminApi';

const FILTER_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'assessed', label: 'Assessed' },
  { id: 'all', label: 'All' },
];

const getPlanStatusBadge = (status) => {
  switch (status) {
    case 'Submitted':
      return 'border-blue-200 bg-blue-100 text-blue-800';
    case 'Under Review':
      return 'border-indigo-200 bg-indigo-100 text-indigo-800';
    case 'ML Assessed':
      return 'border-teal-200 bg-teal-100 text-teal-800';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-800';
  }
};

const getProbabilityColors = (prob) => {
  if (prob >= 70) return 'text-emerald-700 font-bold';
  if (prob >= 40) return 'text-amber-700 font-bold';
  return 'text-red-700 font-bold';
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getEmptyMessage = (filter) => {
  switch (filter) {
    case 'assessed':
      return 'No lifestyle plans have completed ML assessment yet.';
    case 'all':
      return 'No lifestyle plan records were found.';
    case 'active':
    default:
      return 'There are currently no lifestyle plans awaiting review.';
  }
};

const LifestylePlanQueue = () => {
  const [plans, setPlans] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async (filter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPlansForReview(filter);
      if (res.success && res.data) {
        setPlans(res.data);
      }
    } catch (err) {
      console.error('Failed to load lifestyle plan queue:', err);
      setError(err.response?.data?.message || 'Failed to fetch lifestyle plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue(activeFilter);
  }, [activeFilter, fetchQueue]);

  const handleFilterChange = (filterId) => {
    if (filterId !== activeFilter) {
      setActiveFilter(filterId);
    }
  };

  const showPredictionCols = activeFilter === 'assessed' || activeFilter === 'all';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">
          Lifestyle Plan Review Queue
        </h1>
        <p className="mt-2 text-sm text-teal-100 max-w-xl">
          Review submitted lifestyle improvement plans, run the ML assessment, and track
          period-based evidence submissions for active plans.
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
                {opt.label} Plans
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-800">{plans.length}</span>{' '}
          {activeFilter} record(s)
        </span>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 animate-pulse">
          Loading lifestyle plans...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800 space-y-3">
          <p className="font-semibold">Error Loading Queue</p>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchQueue(activeFilter)}
            className="rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white hover:bg-red-900"
          >
            Retry Loading Queue
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="text-4xl">🌱</div>
          <h3 className="font-serif text-lg font-bold text-slate-900">
            No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Plans
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {getEmptyMessage(activeFilter)}
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
                  <th scope="col" className="px-6 py-4">Plan Submitted</th>
                  {showPredictionCols && (
                    <>
                      <th scope="col" className="px-6 py-4">Success Prob.</th>
                      <th scope="col" className="px-6 py-4">Est. Duration</th>
                    </>
                  )}
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((app) => {
                  const applicantName =
                    app.personalInfo?.fullName || app.applicant?.fullName || 'N/A';
                  const applicantNic =
                    app.personalInfo?.nicNumber || app.applicant?.nic || 'N/A';
                  const district =
                    app.personalInfo?.district || app.applicant?.district || 'N/A';
                  const lpStatus = app.lifestylePlan?.status || 'N/A';
                  const prob = app.lifestylePlan?.mlPrediction?.successProbability;
                  const dur = app.lifestylePlan?.mlPrediction?.estimatedDurationMonths;
                  const isAssessed = lpStatus === 'ML Assessed';

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">{applicantName}</td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">{applicantNic}</td>
                      <td className="px-6 py-4 text-slate-700">{district}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(app.lifestylePlan?.submittedAt)}
                      </td>
                      {showPredictionCols && (
                        <>
                          <td className="px-6 py-4">
                            {isAssessed && prob != null ? (
                              <span className={getProbabilityColors(prob)}>
                                {prob}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isAssessed && dur != null ? (
                              <span className="font-semibold text-slate-800">{dur} mo</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getPlanStatusBadge(lpStatus)}`}
                        >
                          {lpStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/lifestyle-plan-queue/${app._id}`}
                          className="inline-flex items-center rounded-lg bg-teal-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800 shadow-sm"
                        >
                          {isAssessed ? 'View Assessment →' : 'Review →'}
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

export default LifestylePlanQueue;
