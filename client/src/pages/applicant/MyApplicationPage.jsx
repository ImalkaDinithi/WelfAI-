import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplication } from '../../api/applicationApi';
import ReviewSubmitStep from '../../components/application-form/ReviewSubmitStep';

const MyApplicationPage = () => {
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
        console.error('Failed to fetch application:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Loading application details...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-slate-900">
          No Application Found
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You have not created a welfare application yet. Click below to begin your application.
        </p>
        <div>
          <Link
            to="/application/new"
            className="inline-block rounded-lg bg-teal-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Start Application →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            My Application Record
          </h1>
          <p className="text-sm text-slate-500">
            Status: <span className="font-semibold text-teal-900">{application.status}</span> • Reference ID: {application._id}
          </p>
        </div>
        {application.status === 'Draft' && (
          <Link
            to="/application/new"
            className="rounded-lg bg-teal-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-teal-800"
          >
            Continue Editing Draft →
          </Link>
        )}
      </div>

      {/* Rejected status callout */}
      {application.status === 'Rejected' && (() => {
        const isWaitingListReject = application.waitingListInfo && application.waitingListInfo.resolution === 'Rejected';
        const notes = isWaitingListReject ? application.waitingListInfo.resolvedNotes : application.reviewNotes;
        const notesTitle = isWaitingListReject ? 'Benefit Disqualification & Rejection Notes:' : 'Admin Review Notes / Determination Explanation:';
        return (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm space-y-3">
            <span className="text-xs font-semibold text-red-800 flex items-center space-x-1">
              <span>❌</span>
              <span>{notesTitle}</span>
            </span>
            <p className="text-xs text-red-900 whitespace-pre-wrap font-medium bg-white/90 p-3 rounded-lg border border-red-200">
              {notes || 'No specific review notes provided by reviewer.'}
            </p>

            {/* Appeal Ruling outcome if present */}
            {application.appeal?.decision && (
              <div className="pt-2 border-t border-red-200">
                <span className="text-xs font-bold text-red-900 block mb-1">
                  Appeal Determination: Upheld Rejection
                </span>
                <p className="text-xs text-red-800 whitespace-pre-wrap font-medium bg-red-100/60 p-3 rounded-lg border border-red-200">
                  {application.appeal.reviewNotes}
                </p>
              </div>
            )}

            {!application.appeal && (
              <div className="pt-1">
                <Link
                  to="/appeal"
                  className="inline-flex items-center rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-900 shadow-sm"
                >
                  Appeal This Decision →
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {/* Waiting List status callout */}
      {application.status === 'Waiting List' && (
        <div className="rounded-xl border border-amber-250 bg-amber-50 p-5 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-amber-805 flex items-center space-x-1.5">
            <span>⚠️</span>
            <span>Benefit Placed on Waiting List:</span>
          </span>
          <div className="text-xs text-amber-900 font-medium bg-white/90 p-3 rounded-lg border border-amber-200">
            <p className="font-semibold">Reason: {application.waitingListInfo?.reason}</p>
            {application.waitingListInfo?.disqualifiedAt && (
              <p className="text-[10px] text-slate-500 mt-1">Disqualified on: {new Date(application.waitingListInfo.disqualifiedAt).toLocaleDateString('en-LK')}</p>
            )}
          </div>
          <p className="text-xs text-amber-700 font-medium">
            Continue submitting evidence for your improvement plan to be considered for reinstatement.
          </p>
          <div>
            <Link
              to="/lifestyle-plan/evidence"
              className="inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-805 shadow-sm"
            >
              Upload Plan Evidence →
            </Link>
          </div>
        </div>
      )}

      {/* Appealed status callout */}
      {application.status === 'Appealed' && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-900 flex items-center space-x-1">
              <span>⚖️</span>
              <span>Appeal Submitted & Under Review</span>
            </span>
            <span className="text-xs text-purple-700 font-medium">
              Submitted: {application.appeal?.submittedAt ? new Date(application.appeal.submittedAt).toLocaleDateString('en-LK') : 'N/A'}
            </span>
          </div>
          <p className="text-xs text-purple-800">
            Grounds: <strong>{application.appeal?.groundsForAppeal}</strong>
          </p>
          <div>
            <Link
              to="/appeal"
              className="inline-flex items-center rounded-lg border border-purple-300 bg-white px-4 py-1.5 text-xs font-semibold text-purple-900 hover:bg-purple-50"
            >
              View Appeal Details →
            </Link>
          </div>
        </div>
      )}

      {/* Approved status callout */}
      {application.status === 'Approved' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-emerald-800 flex items-center space-x-1">
            <span>✅</span>
            <span>
              {application.appeal?.decision === 'Approved'
                ? 'Application Approved via Appeal'
                : 'Application Approved'}
            </span>
          </span>
          {application.waitingListInfo?.resolution === 'Reinstated' ? (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-900 block">Benefit Reinstated Notes:</span>
              <div className="text-xs text-emerald-900 bg-white/90 p-3 rounded border border-emerald-200 space-y-1">
                <p>Your benefit was reinstated on {new Date(application.waitingListInfo.resolvedAt).toLocaleDateString('en-LK')}.</p>
                <p className="font-medium">Feedback: {application.waitingListInfo.resolvedNotes}</p>
              </div>
            </div>
          ) : application.appeal?.decision === 'Approved' && application.appeal?.reviewNotes ? (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-900 block">Appeals Committee Determination Notes:</span>
              <p className="text-xs text-emerald-900 whitespace-pre-wrap font-medium bg-white/90 p-3 rounded-lg border border-emerald-200">
                {application.appeal.reviewNotes}
              </p>
            </div>
          ) : application.reviewNotes ? (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-900 block">Admin Review Notes / Determination Explanation:</span>
              <p className="text-xs text-emerald-905 whitespace-pre-wrap font-medium bg-white/90 p-3 rounded-lg border border-emerald-200">
                {application.reviewNotes}
              </p>
            </div>
          ) : (
            <p className="text-xs text-emerald-700">
              Your application has been approved by the welfare administration committee.
            </p>
          )}
        </div>
      )}

      {/* Lifestyle Plan callout in MyApplicationPage */}
      {application.status === 'Approved' && (() => {
        const lp = application.lifestylePlan;
        const lpStatus = lp?.status;
        if (!lp || lpStatus === 'Not Started') {
          return (
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-teal-950 flex items-center space-x-1.5 font-serif">
                  <span>🌱</span>
                  <span>Lifestyle Improvement Plan</span>
                </h3>
                <p className="text-xs text-teal-850 mt-1">
                  Your application is approved. Submit your lifestyle improvement plan to begin the next phase of your welfare support.
                </p>
              </div>
              <Link
                to="/dashboard/lifestyle-plan"
                className="rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition shadow-sm shrink-0"
              >
                Submit Plan →
              </Link>
            </div>
          );
        }

        if (lpStatus === 'ML Assessed') {
          const prob = lp.mlPrediction?.successProbability ?? 0;
          const dur = lp.mlPrediction?.estimatedDurationMonths ?? 0;
          let badgeColor = 'bg-red-100 text-red-800 border-red-200';
          if (prob >= 70) badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
          else if (prob >= 40) badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';

          return (
            <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-teal-950 flex items-center space-x-1.5 font-serif">
                  <span>🌱</span>
                  <span>Lifestyle Plan — Assessed</span>
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                  {prob}% success
                </span>
              </div>
              <p className="text-xs text-slate-600">
                ML assessment complete. Estimated program duration: <strong>{dur} months</strong>.
              </p>
              <Link
                to="/dashboard/lifestyle-plan"
                className="inline-flex items-center text-xs font-semibold text-teal-900 hover:underline"
              >
                View full assessment &amp; evidence portal →
              </Link>
            </div>
          );
        }

        return (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-1.5 font-serif">
              <span>🌱</span>
              <span>Lifestyle Plan: <span className="text-slate-700">{lpStatus}</span></span>
            </h3>
            <Link
              to="/dashboard/lifestyle-plan"
              className="text-xs font-semibold text-teal-800 hover:underline"
            >
              View details →
            </Link>
          </div>
        );
      })()}




      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ReviewSubmitStep
          formData={application}
          onEditStep={() => {}}
          onSubmitSuccess={() => {}}
        />
      </div>
    </div>
  );
};

export default MyApplicationPage;
