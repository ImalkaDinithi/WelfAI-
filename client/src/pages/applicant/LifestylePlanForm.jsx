import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyApplication, submitLifestylePlan } from '../../api/applicationApi';

const FOCUS_AREA_OPTIONS = [
  'Employment',
  'Vocational Training',
  'Small Business',
  'Education',
  'Health And Wellbeing',
  'Housing Improvement',
  'Other',
];

const SUPPORT_OPTIONS = [
  'Vocational Training Placement',
  'Small Business Start-Up Capital',
  'Educational Bursary',
  'Counselling And Guidance',
  'Other',
];

const LifestylePlanForm = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [focusAreas, setFocusAreas] = useState([]);
  const [goals, setGoals] = useState('');
  const [actionSteps, setActionSteps] = useState('');
  const [supportRequested, setSupportRequested] = useState('');
  const [requestedDurationMonths, setRequestedDurationMonths] = useState('');
  const [declared, setDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Field-level error state
  const [focusError, setFocusError] = useState('');
  const [goalsError, setGoalsError] = useState('');
  const [actionStepsError, setActionStepsError] = useState('');

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await getMyApplication();
        if (res.success && res.data) {
          setApplication(res.data);
        }
      } catch (err) {
        console.error('Failed to load application for lifestyle plan form:', err);
        setError(err.response?.data?.message || 'Failed to load application data');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, []);

  const toggleFocusArea = (area) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
    setFocusError('');
  };

  const validate = () => {
    let valid = true;
    if (focusAreas.length === 0) {
      setFocusError('Please select at least one focus area');
      valid = false;
    }
    if (!goals.trim()) {
      setGoalsError('Goals are required');
      valid = false;
    }
    if (!actionSteps.trim()) {
      setActionStepsError('Action steps are required');
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!declared) {
      toast.error('You must confirm the declaration before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await submitLifestylePlan(
        focusAreas,
        goals.trim(),
        actionSteps.trim(),
        supportRequested || undefined,
        requestedDurationMonths ? Number(requestedDurationMonths) : undefined
      );
      toast.success('Lifestyle improvement plan submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Plan submission error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit lifestyle plan. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Guard: loading ----
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Loading your application data…</p>
      </div>
    );
  }

  // ---- Guard: error ----
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm">
          <p className="font-semibold text-red-800 mb-2">Could Not Load Application</p>
          <p className="text-xs text-red-700">{error}</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ---- Guard: application not approved ----
  if (!application || application.status !== 'Approved') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center max-w-sm">
          <p className="text-2xl mb-2">&#128274;</p>
          <p className="font-semibold text-amber-900 mb-1">Plan Not Available</p>
          <p className="text-xs text-amber-700">
            Your lifestyle improvement plan can only be submitted once your welfare application is
            approved.
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ---- Guard: plan already submitted past 'Not Started' ----
  const planStatus = application.lifestylePlan?.status;
  const planAlreadySubmitted = application.lifestylePlan && planStatus !== 'Not Started';

  if (planAlreadySubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-8 text-center max-w-sm shadow-sm">
          <p className="text-3xl mb-3">&#9989;</p>
          <p className="font-serif text-lg font-bold text-teal-900 mb-1">Plan Submitted</p>
          <p className="text-xs text-teal-700 mb-2">
            Your lifestyle improvement plan has been submitted and is currently{' '}
            <strong>{planStatus?.toLowerCase()}</strong>. Our team will review it shortly.
          </p>
          <Link
            to="/dashboard"
            className="mt-3 inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ---- Main form ----
  const emp = application.employmentInfo || {};
  const edu = application.educationSkills || {};
  const inc = application.incomeInfo || {};

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
          <Link
            to="/dashboard"
            className="text-xs text-teal-300 hover:text-white mb-3 inline-flex items-center space-x-1"
          >
            <span>&larr;</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
            Lifestyle Improvement Plan
          </h1>
          <p className="mt-2 text-sm text-teal-100 max-w-xl">
            Share your goals and preferred support type so we can assess how best to support your
            long-term wellbeing and self-sufficiency.
          </p>
        </div>

        {/* Read-only context card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            Your Current Profile (Read-Only)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Occupation</span>
              <span className="font-semibold text-slate-800">
                {emp.occupation || emp.employmentStatus || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Highest Education</span>
              <span className="font-semibold text-slate-800">
                {edu.highestEducationalQualification || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Monthly Household Income</span>
              <span className="font-semibold text-slate-800">
                {inc.totalMonthlyHouseholdIncome != null
                  ? `Rs. ${inc.totalMonthlyHouseholdIncome.toLocaleString()}`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Focus Areas */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-serif text-sm font-bold text-slate-900 mb-1">
              Focus Areas <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Select all areas you would like to focus on for improvement.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FOCUS_AREA_OPTIONS.map((area) => (
                <label
                  key={area}
                  className={`flex items-center space-x-2.5 rounded-lg border px-3.5 py-2.5 cursor-pointer transition text-xs font-medium ${
                    focusAreas.includes(area)
                      ? 'border-teal-700 bg-teal-50 text-teal-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-teal-50/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={focusAreas.includes(area)}
                    onChange={() => toggleFocusArea(area)}
                    className="accent-teal-800 h-3.5 w-3.5 flex-shrink-0"
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
            {focusError && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{focusError}</p>
            )}
          </div>

          {/* Goals */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="lifestyle-goals"
              className="font-serif text-sm font-bold text-slate-900 mb-1 block"
            >
              Your Goals <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Describe what you want to achieve through this plan (max 1000 characters).
            </p>
            <textarea
              id="lifestyle-goals"
              rows={4}
              maxLength={1000}
              value={goals}
              onChange={(e) => {
                setGoals(e.target.value);
                setGoalsError('');
              }}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40 resize-none ${
                goalsError ? 'border-red-400 bg-red-50' : 'border-slate-300'
              }`}
              placeholder="e.g. I aim to complete a vocational training programme and secure stable employment within 12 months..."
            />
            <div className="flex items-center justify-between mt-1">
              {goalsError ? (
                <p className="text-xs text-red-600 font-medium">{goalsError}</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-slate-400">{goals.length}/1000</span>
            </div>
          </div>

          {/* Action Steps */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="lifestyle-action-steps"
              className="font-serif text-sm font-bold text-slate-900 mb-1 block"
            >
              Action Steps <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Describe the concrete steps you plan to take to achieve your goals (max 1500
              characters).
            </p>
            <textarea
              id="lifestyle-action-steps"
              rows={5}
              maxLength={1500}
              value={actionSteps}
              onChange={(e) => {
                setActionSteps(e.target.value);
                setActionStepsError('');
              }}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40 resize-none ${
                actionStepsError ? 'border-red-400 bg-red-50' : 'border-slate-300'
              }`}
              placeholder="e.g. Step 1: Register for the NAITA welding course by end of month. Step 2: Complete 3-month course..."
            />
            <div className="flex items-center justify-between mt-1">
              {actionStepsError ? (
                <p className="text-xs text-red-600 font-medium">{actionStepsError}</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-slate-400">{actionSteps.length}/1500</span>
            </div>
          </div>

          {/* Support Requested + Duration */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="support-requested"
                className="font-serif text-sm font-bold text-slate-900 mb-1 block"
              >
                Support Requested
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Select the type of support you are seeking.
              </p>
              <select
                id="support-requested"
                value={supportRequested}
                onChange={(e) => setSupportRequested(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40"
              >
                <option value="">-- Select support type --</option>
                {SUPPORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="duration-months"
                className="font-serif text-sm font-bold text-slate-900 mb-1 block"
              >
                Requested Duration (Months)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                How long do you anticipate needing support? (1-60 months)
              </p>
              <input
                id="duration-months"
                type="number"
                min={1}
                max={60}
                value={requestedDurationMonths}
                onChange={(e) => setRequestedDurationMonths(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40"
                placeholder="e.g. 12"
              />
            </div>
          </div>

          {/* Declaration */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                id="declaration-checkbox"
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 accent-teal-800 h-4 w-4 flex-shrink-0"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                I declare that the information provided in this lifestyle improvement plan is
                accurate and truthful to the best of my knowledge. I understand that false or
                misleading information may result in disqualification from the welfare programme.
              </span>
            </label>
          </div>

          {/* Submit / Cancel */}
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              &larr; Cancel
            </Link>
            <button
              id="submit-lifestyle-plan-btn"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-teal-900 px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Lifestyle Plan \u2192'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LifestylePlanForm;
