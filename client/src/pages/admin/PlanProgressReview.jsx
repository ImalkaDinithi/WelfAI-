import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPlanProgress, reviewPlanPeriod, disqualifyApplication } from '../../api/adminApi';

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

const PlanProgressReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store notes text areas state by period label
  const [notesState, setNotesState] = useState({});
  const [submittingPeriod, setSubmittingPeriod] = useState({});

  // Disqualification Form States
  const [showDisqualifyForm, setShowDisqualifyForm] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState('');
  const [disqualifyError, setDisqualifyError] = useState('');
  const [disqualifying, setDisqualifying] = useState(false);

  const handleDisqualify = async () => {
    if (!disqualifyReason.trim()) {
      setDisqualifyError('Please provide a reason for disqualification.');
      return;
    }

    setDisqualifying(true);
    try {
      const res = await disqualifyApplication(id, disqualifyReason);
      if (res.success) {
        toast.success('Applicant disqualified successfully and moved to waiting list.');
        navigate('/admin/waiting-list-queue');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to disqualify applicant.');
    } finally {
      setDisqualifying(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await getPlanProgress(id);
      if (res.success && res.data) {
        setPlanData(res.data);
        // Initialize review notes state
        const initialNotes = {};
        res.data.periods.forEach((p) => {
          initialNotes[p.periodLabel] = p.reviewNotes || '';
        });
        setNotesState(initialNotes);
      }
    } catch (err) {
      console.error('Failed to load plan progress:', err);
      setError(err.response?.data?.message || 'Failed to fetch plan progress');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProgress();
      setLoading(false);
    };
    init();
  }, [id]);

  const handleReviewPeriod = async (periodLabel) => {
    const notes = notesState[periodLabel] || '';
    setSubmittingPeriod((prev) => ({ ...prev, [periodLabel]: true }));
    try {
      const res = await reviewPlanPeriod(id, periodLabel, notes);
      if (res.success) {
        toast.success(`Marked ${periodLabel} as reviewed`);
        await fetchProgress();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || `Failed to review ${periodLabel}`);
    } finally {
      setSubmittingPeriod((prev) => ({ ...prev, [periodLabel]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400 animate-pulse">Loading progress review...</p>
      </div>
    );
  }

  if (error || !planData) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm mx-auto my-12">
        <p className="font-semibold text-red-800 mb-2">Error Loading Progress</p>
        <p className="text-xs text-red-700">{error || 'Record not found'}</p>
        <Link
          to="/admin/lifestyle-plan-queue"
          className="mt-4 inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white"
        >
          &larr; Back to Queue
        </Link>
      </div>
    );
  }

  const periods = planData.periods || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <Link
          to={`/admin/lifestyle-plan-queue/${id}`}
          className="text-xs text-teal-300 hover:text-white mb-3 inline-flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span>Back to Plan Review Page</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-1">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Lifestyle Plan Progress Timeline</h1>
            <p className="mt-1 text-sm text-teal-100">
              Assessing milestones and verifying evidence for all periods.
            </p>
          </div>
          <div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getPlanStatusBadge(planData.status)}`}>
              {planData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Disqualify Benefit Panel */}
      {planData.applicationStatus === 'Approved' && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-bold text-red-950 flex items-center space-x-2">
                <span>⚠️</span>
                <span>Benefit Disqualification Action</span>
              </h3>
              <p className="text-xs text-red-900 mt-1">
                Disqualify this applicant from receiving benefits if they are failing to adhere to their lifestyle improvement plan. This will move them to the waiting list.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowDisqualifyForm(!showDisqualifyForm)}
                className="rounded-lg bg-red-750 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-red-800 transition shadow-sm shrink-0"
              >
                {showDisqualifyForm ? 'Cancel Disqualification' : 'Disqualify from Benefit'}
              </button>
            </div>
          </div>

          {showDisqualifyForm && (
            <div className="border-t border-red-200/65 pt-4 space-y-3">
              <label htmlFor="disqualify-reason" className="text-xs font-bold text-red-950 block">
                Disqualification Reason (Required)
              </label>
              <textarea
                id="disqualify-reason"
                rows={3}
                value={disqualifyReason}
                onChange={(e) => {
                  setDisqualifyReason(e.target.value);
                  setDisqualifyError('');
                }}
                placeholder="Explain the specific reasons for disqualifying this applicant from benefits..."
                className={`w-full rounded-lg border bg-white p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none ${
                  disqualifyError ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {disqualifyError && (
                <p className="text-xs text-red-600 font-medium">{disqualifyError}</p>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={disqualifying}
                  onClick={handleDisqualify}
                  className="rounded-lg bg-red-900 px-5 py-2 text-xs font-bold text-white hover:bg-red-950 transition shadow-sm disabled:opacity-50"
                >
                  {disqualifying ? 'Processing Disqualification...' : 'Confirm Disqualification'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Cards */}
      <div className="space-y-4">
        {periods.map((period) => {
          const isReviewed = period.reviewStatus === 'Reviewed';
          const docs = period.documents || [];
          return (
            <div
              key={period.periodLabel}
              className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                isReviewed ? 'border-emerald-200 bg-emerald-50/5' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-serif text-base font-bold text-slate-900">
                    {period.periodLabel}
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                    isReviewed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {period.reviewStatus}
                  </span>
                </div>
                {isReviewed && period.reviewedAt && (
                  <span className="text-[11px] text-slate-550">
                    Reviewed on {formatDate(period.reviewedAt)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Uploaded Documents */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                    Evidence Submissions
                  </span>
                  {docs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 rounded-lg p-4 text-center border border-dashed border-slate-100">
                      No documents submitted yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 block truncate max-w-50" title={doc.fileName}>
                              {doc.fileName}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                              {doc.documentType} • {formatDate(doc.uploadedAt)}
                            </span>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-teal-800 hover:text-teal-905"
                          >
                            Open File &rarr;
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Admin Review Notes Form */}
                <div className="space-y-3">
                  <label
                    htmlFor={`review-notes-${period.periodLabel}`}
                    className="text-xs font-semibold text-slate-600 uppercase tracking-wider block"
                  >
                    Review Notes
                  </label>
                  <textarea
                    id={`review-notes-${period.periodLabel}`}
                    rows={3}
                    value={notesState[period.periodLabel] || ''}
                    onChange={(e) =>
                      setNotesState((prev) => ({ ...prev, [period.periodLabel]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none"
                    placeholder="Provide optional notes or feedback regarding this period's evidence..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={submittingPeriod[period.periodLabel]}
                      onClick={() => handleReviewPeriod(period.periodLabel)}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition ${
                        isReviewed
                          ? 'bg-slate-150 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          : 'bg-teal-900 text-white hover:bg-teal-800'
                      }`}
                    >
                      {submittingPeriod[period.periodLabel]
                        ? 'Saving...'
                        : isReviewed
                        ? 'Update Notes'
                        : 'Mark Reviewed'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanProgressReview;