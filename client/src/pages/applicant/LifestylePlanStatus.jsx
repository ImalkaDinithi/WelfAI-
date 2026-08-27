import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplication } from '../../api/applicationApi';

// Shared probability color helper — also used by LifestylePlanQueue (admin side)
export const getProbabilityColors = (prob) => {
  if (prob >= 70) {
    return {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bar: 'bg-emerald-600',
      ring: 'text-emerald-700',
    };
  }
  if (prob >= 40) {
    return {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      bar: 'bg-amber-500',
      ring: 'text-amber-700',
    };
  }
  return {
    badge: 'bg-red-100 text-red-800 border-red-200',
    bar: 'bg-red-600',
    ring: 'text-red-700',
  };
};

const LifestylePlanStatus = () => {
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
        console.error('Failed to load lifestyle plan status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-400 animate-pulse">
        Loading your lifestyle plan status...
      </div>
    );
  }

  // ── Not yet eligible: application not approved ───────────────────────────
  if (!application || application.status !== 'Approved') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Lifestyle Improvement Plan</h1>
          <p className="mt-2 text-sm text-teal-100 max-w-xl">
            Track your lifestyle plan assessment results and manage your monthly evidence submissions.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="font-serif text-lg font-bold text-slate-900">Not Yet Eligible</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The Lifestyle Improvement Plan is available once your welfare application has been reviewed
            and approved by the administration.
          </p>
          <p className="text-xs text-slate-400">
            Current application status:{' '}
            <span className="font-semibold text-slate-700">
              {application?.status || 'No application found'}
            </span>
          </p>
          {!application && (
            <div className="pt-2">
              <Link
                to="/application/new"
                className="inline-flex items-center rounded-lg bg-teal-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 shadow-sm"
              >
                Start Welfare Application →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const lp = application.lifestylePlan;
  const lpStatus = lp?.status;

  // ── Approved but plan not submitted ──────────────────────────────────────
  if (!lp || lpStatus === 'Not Started') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Lifestyle Improvement Plan</h1>
          <p className="mt-2 text-sm text-teal-100 max-w-xl">
            Your welfare application has been approved. The next step is to submit your lifestyle improvement plan.
          </p>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-8 shadow-sm space-y-5">
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-900 text-2xl shadow">
              🌱
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-teal-950">Submit Your Lifestyle Plan</h2>
              <p className="text-sm text-teal-800 mt-1 max-w-lg">
                Your application is approved. Complete your Lifestyle Improvement Plan to unlock your
                ML success assessment and begin tracking your monthly progress milestones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { emoji: '📋', title: 'Define your goals', text: 'Set clear focus areas, goals, and action steps.' },
              { emoji: '🤖', title: 'ML Assessment', text: 'Admin runs an ML model to predict your success probability.' },
              { emoji: '📁', title: 'Monthly evidence', text: 'Upload progress evidence each month of your program.' },
            ].map((step) => (
              <div key={step.title} className="rounded-lg bg-white border border-teal-100 p-4 shadow-sm">
                <div className="text-2xl mb-2">{step.emoji}</div>
                <div className="text-xs font-bold text-teal-900">{step.title}</div>
                <p className="text-[11px] text-slate-500 mt-1">{step.text}</p>
              </div>
            ))}
          </div>

          <div>
            <Link
              to="/lifestyle-plan"
              className="inline-flex items-center rounded-lg bg-teal-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 shadow-sm"
            >
              Submit Your Lifestyle Improvement Plan →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Plan submitted or under review ───────────────────────────────────────
  if (lpStatus === 'Submitted' || lpStatus === 'Under Review') {
    const statusLabel = lpStatus === 'Submitted' ? 'Awaiting Review' : 'Under Review';
    const statusBadge =
      lpStatus === 'Submitted'
        ? 'bg-blue-100 text-blue-800 border-blue-200'
        : 'bg-indigo-100 text-indigo-800 border-indigo-200';

    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Lifestyle Improvement Plan</h1>
          <p className="mt-2 text-sm text-teal-100 max-w-xl">
            Your plan has been submitted and is being processed by the administration.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🌱</span>
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-900">Plan Submitted</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submitted on{' '}
                  {lp.submittedAt
                    ? new Date(lp.submittedAt).toLocaleDateString('en-LK', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge}`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="text-sm text-slate-600 max-w-xl">
            Your lifestyle improvement plan is currently{' '}
            <strong>{statusLabel.toLowerCase()}</strong> by the welfare administration team. An ML
            success assessment will be run and you'll be notified once it's complete.
          </p>

          <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Plan Summary</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(lp.focusAreas || []).map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[11px] font-medium text-teal-900"
                >
                  {area}
                </span>
              ))}
            </div>
            {lp.requestedDurationMonths && (
              <p className="text-xs text-slate-600 mt-1">
                Requested duration:{' '}
                <span className="font-semibold text-slate-800">{lp.requestedDurationMonths} months</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── ML Assessed ───────────────────────────────────────────────────────────
  if (lpStatus === 'ML Assessed') {
    const prob = lp.mlPrediction?.successProbability ?? 0;
    const dur = lp.mlPrediction?.estimatedDurationMonths ?? 0;
    const colors = getProbabilityColors(prob);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Lifestyle Improvement Plan</h1>
            <p className="mt-1 text-sm text-teal-100">
              Your plan has been assessed. Below are your ML prediction results.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-4 border border-white/10 text-center shrink-0">
            <span className="block text-xs text-teal-300 font-semibold uppercase tracking-wide mb-1">
              Prediction Success
            </span>
            <span className="font-serif text-4xl font-bold">{prob}%</span>
          </div>
        </div>

        {/* Prediction Result Card */}
        <div className="rounded-xl border border-teal-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-slate-900">Assessment Result</h2>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${colors.badge}`}>
              ML Assessed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Probability */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide block">
                ML Success Probability
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-slate-800">{prob}%</span>
                <span className="text-[11px] text-slate-450 italic">based on your submitted plan</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${colors.bar} transition-all duration-700`}
                  style={{ width: `${prob}%` }}
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide block mb-2">
                Estimated Duration
              </span>
              <span className="font-serif text-4xl font-bold text-slate-800">{dur}</span>
              <span className="text-base text-slate-500 font-medium ml-1">months</span>
              <p className="text-[11px] text-slate-400 mt-2 italic">
                Expected timeline for completing your program milestones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wide">Model Version</span>
              <span className="font-mono font-semibold text-slate-700">{lp.mlPrediction?.modelVersion ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wide">Assessed On</span>
              <span className="font-semibold text-slate-700">
                {lp.mlPrediction?.predictedAt
                  ? new Date(lp.mlPrediction.predictedAt).toLocaleDateString('en-LK', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed">
          <strong>Disclaimer:</strong> This assessment is an automated ML estimate generated based on
          your submitted lifestyle improvement plan and current application parameters. It is intended
          to guide milestones and is{' '}
          <strong>not a guarantee of success or ongoing welfare funding</strong>.
        </div>

        {/* Action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/lifestyle-plan/evidence"
            className="inline-flex items-center justify-center rounded-lg bg-teal-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 shadow-sm"
          >
            📁 Upload &amp; View Progress Evidence →
          </Link>
          {lp.adminReviewNotes && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-700 max-w-lg">
              <span className="block font-semibold text-slate-800 mb-0.5">Admin Notes:</span>
              {lp.adminReviewNotes}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Fallback ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      Lifestyle plan status: <strong>{lpStatus}</strong>
    </div>
  );
};

export default LifestylePlanStatus;
