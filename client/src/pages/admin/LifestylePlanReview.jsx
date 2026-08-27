import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApplicationById, markPlanUnderReview, runMlPrediction } from '../../api/adminApi';

const getPlanStatusBadge = (status) => {
  switch (status) {
    case 'Submitted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Under Review':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'ML Assessed':
      return 'bg-teal-100 text-teal-800 border-teal-200';
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

const ReadOnlyField = ({ label, value }) => (
  <div>
    <span className="text-slate-500 block text-xs mb-0.5">{label}</span>
    <span className="font-semibold text-slate-800 text-sm">{value || 'N/A'}</span>
  </div>
);

const LifestylePlanReview = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ML prediction panel state
  const [adminReviewNotes, setAdminReviewNotes] = useState('');
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    const initReview = async () => {
      try {
        // Mark as Under Review on first open (no-op if already past Submitted)
        await markPlanUnderReview(id);
        // Load full application
        const res = await getApplicationById(id);
        if (res.success && res.data) {
          setApplication(res.data);
        }
      } catch (err) {
        console.error('Failed to load lifestyle plan for review:', err);
        setError(err.response?.data?.message || 'Failed to load lifestyle plan');
      } finally {
        setLoading(false);
      }
    };
    initReview();
  }, [id]);

  const handleRunPrediction = async () => {
    setPredicting(true);
    try {
      const res = await runMlPrediction(id, adminReviewNotes);
      if (res.success && res.data) {
        setApplication(res.data);
        toast.success('ML prediction completed successfully!');
      }
    } catch (err) {
      console.error('ML prediction error:', err);
      toast.error(err.response?.data?.message || 'Failed to run ML prediction. Please try again.');
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400 animate-pulse">Loading lifestyle plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm mx-auto">
        <p className="font-semibold text-red-800 mb-2">Error Loading Plan</p>
        <p className="text-xs text-red-700">{error}</p>
        <Link
          to="/admin/lifestyle-plan-queue"
          className="mt-4 inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
        >
          &larr; Back to Queue
        </Link>
      </div>
    );
  }

  if (!application || !application.lifestylePlan) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center max-w-sm mx-auto">
        <p className="font-semibold text-amber-900 mb-2">No Lifestyle Plan Found</p>
        <p className="text-xs text-amber-700">This application does not have a lifestyle plan submitted.</p>
        <Link
          to="/admin/lifestyle-plan-queue"
          className="mt-4 inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
        >
          &larr; Back to Queue
        </Link>
      </div>
    );
  }

  const lp = application.lifestylePlan;
  const emp = application.employmentInfo || {};
  const edu = application.educationSkills || {};
  const inc = application.incomeInfo || {};
  const pi = application.personalInfo || {};
  const isAssessed = lp.status === 'ML Assessed';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <Link
          to="/admin/lifestyle-plan-queue"
          className="text-xs text-teal-300 hover:text-white mb-3 inline-flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span>Back to Lifestyle Plan Queue</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-1">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Lifestyle Plan Review
            </h1>
            <p className="mt-1 text-sm text-teal-100">
              {pi.fullName || application.applicant?.fullName || 'Applicant'} &mdash;{' '}
              {pi.nicNumber || 'N/A'} &mdash; {pi.district || 'N/A'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getPlanStatusBadge(lp.status)}`}
            >
              {lp.status}
            </span>
          </div>
        </div>
      </div>

      {/* Read-only applicant context card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
          Applicant Profile
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <ReadOnlyField
            label="Occupation"
            value={emp.occupation || emp.employmentStatus}
          />
          <ReadOnlyField
            label="Employment Status"
            value={emp.employmentStatus}
          />
          <ReadOnlyField
            label="Highest Education"
            value={edu.highestEducationalQualification}
          />
          <ReadOnlyField
            label="Monthly Household Income"
            value={
              inc.totalMonthlyHouseholdIncome != null
                ? `Rs. ${inc.totalMonthlyHouseholdIncome.toLocaleString()}`
                : undefined
            }
          />
          <ReadOnlyField
            label="Household Size"
            value={application.householdInfo?.numberOfFamilyMembers}
          />
          <ReadOnlyField
            label="Plan Submitted"
            value={formatDate(lp.submittedAt)}
          />
        </div>
      </div>

      {/* Plan details — read-only */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <h2 className="font-serif text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
          Submitted Plan Details
        </h2>

        {/* Focus Areas */}
        <div>
          <span className="text-xs text-slate-500 block mb-1.5">Focus Areas</span>
          <div className="flex flex-wrap gap-2">
            {(lp.focusAreas || []).length > 0 ? (
              lp.focusAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-3 py-0.5 text-xs font-medium text-teal-900"
                >
                  {area}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">None selected</span>
            )}
          </div>
        </div>

        {/* Goals */}
        <div>
          <span className="text-xs text-slate-500 block mb-1">Goals</span>
          <p className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 rounded-lg border border-slate-100 p-3.5 leading-relaxed">
            {lp.goals || '—'}
          </p>
        </div>

        {/* Action Steps */}
        <div>
          <span className="text-xs text-slate-500 block mb-1">Action Steps</span>
          <p className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 rounded-lg border border-slate-100 p-3.5 leading-relaxed">
            {lp.actionSteps || '—'}
          </p>
        </div>

        {/* Support Requested + Duration */}
        <div className="grid grid-cols-2 gap-5">
          <ReadOnlyField
            label="Support Requested"
            value={lp.supportRequested}
          />
          <ReadOnlyField
            label="Requested Duration"
            value={lp.requestedDurationMonths ? `${lp.requestedDurationMonths} months` : undefined}
          />
        </div>
      </div>

      {/* ML Prediction Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
          ML Assessment
        </h2>

        {isAssessed ? (
          // -- Read-only past ML Assessed --
          <div className="space-y-4">
            <div className="rounded-lg border border-teal-200 bg-teal-50/80 p-4 space-y-4">
              <p className="text-xs font-semibold text-teal-900 flex items-center space-x-1">
                <span>&#129302;</span>
                <span>Prediction Results (Mock v0)</span>
              </p>
              <div className="grid grid-cols-2 gap-6">
                {/* Success Probability gauge */}
                <div className="space-y-1">
                  <span className="text-xs text-teal-700 block">Success Probability</span>
                  <div className="flex items-end gap-2">
                    <span className="font-serif text-3xl font-bold text-teal-900">
                      {lp.mlPrediction?.successProbability ?? '—'}
                      <span className="text-lg">%</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-teal-100 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-teal-700 transition-all"
                      style={{ width: `${lp.mlPrediction?.successProbability ?? 0}%` }}
                    />
                  </div>
                </div>
                {/* Estimated Duration */}
                <div className="space-y-1">
                  <span className="text-xs text-teal-700 block">Estimated Duration</span>
                  <span className="font-serif text-3xl font-bold text-teal-900">
                    {lp.mlPrediction?.estimatedDurationMonths ?? '—'}
                    <span className="text-lg font-normal text-teal-700"> mo</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-teal-700 pt-1 border-t border-teal-200">
                <div>
                  <span className="text-teal-600 block">Model Version</span>
                  <span className="font-mono font-semibold">{lp.mlPrediction?.modelVersion ?? 'N/A'}</span>
                </div>
                <div>
                  <span className="text-teal-600 block">Assessed At</span>
                  <span className="font-semibold">{formatDate(lp.mlPrediction?.predictedAt)}</span>
                </div>
              </div>
            </div>

            {lp.adminReviewNotes && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Admin Review Notes</span>
                <p className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 rounded-lg border border-slate-100 p-3.5">
                  {lp.adminReviewNotes}
                </p>
              </div>
            )}

            <div className="pt-2">
              <Link
                to={`/admin/lifestyle-plan-queue/${id}/progress`}
                className="inline-flex items-center justify-center rounded-lg bg-teal-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 transition"
              >
                📊 View Progress Evidence & Timeline &rarr;
              </Link>
            </div>

            <p className="text-xs text-slate-400 italic">
              This plan has been ML-assessed. Re-running or finalising is out of scope for this phase.
            </p>
          </div>
        ) : (
          // -- Active prediction panel --
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Run the ML model to generate a success probability and estimated duration for this
              applicant's lifestyle plan based on their application data.
            </p>

            <div>
              <label
                htmlFor="admin-review-notes"
                className="text-xs font-semibold text-slate-700 block mb-1"
              >
                Admin Review Notes{' '}
                <span className="font-normal text-slate-400">(optional — saved alongside prediction)</span>
              </label>
              <textarea
                id="admin-review-notes"
                rows={3}
                value={adminReviewNotes}
                onChange={(e) => setAdminReviewNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40 resize-none"
                placeholder="Optional: add context about this plan before running the prediction..."
              />
            </div>

            <button
              id="run-ml-prediction-btn"
              type="button"
              onClick={handleRunPrediction}
              disabled={predicting}
              className="inline-flex items-center rounded-lg bg-teal-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {predicting ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Running Prediction...
                </>
              ) : (
                '&#129302; Run ML Prediction'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifestylePlanReview;
