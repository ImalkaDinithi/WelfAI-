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

      {application.status === 'Rejected' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-red-800 flex items-center space-x-1">
            <span>❌</span>
            <span>Admin Review Notes / Determination Explanation:</span>
          </span>
          <p className="text-xs text-red-900 whitespace-pre-wrap font-medium bg-white/90 p-3 rounded-lg border border-red-200">
            {application.reviewNotes || 'No specific review notes provided by reviewer.'}
          </p>
        </div>
      )}

      {application.status === 'Approved' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-emerald-800 flex items-center space-x-1">
            <span>✅</span>
            <span>Application Approved</span>
          </span>
          {application.reviewNotes ? (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-900 block">Admin Review Notes / Determination Explanation:</span>
              <p className="text-xs text-emerald-900 whitespace-pre-wrap font-medium bg-white/90 p-3 rounded-lg border border-emerald-200">
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
