import { useState, useEffect } from 'react';
import { getMyApplication } from '../../api/applicationApi';

const FraudResultPage = () => {
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
        console.error('Failed to load application fraud data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading fraud analysis status...</div>;
  }

  const score = application?.fraudRiskScore;
  const isFlagged = application?.fraudFlag;

  const getRiskLevel = (val) => {
    if (val === null || val === undefined) return null;
    if (val < 0.3) return { label: 'Low Risk', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (val < 0.7) return { label: 'Medium Risk', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'High Risk', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  const riskLevel = getRiskLevel(score);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Fraud & Verification Analysis
        </h1>
        <p className="text-sm text-slate-500">
          Automated integrity check and risk score evaluation status.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {score === null || score === undefined ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-xl">
              ⏳
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-800">
              Not Yet Evaluated
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Verification results and fraud risk scores will appear here after your submitted application undergoes automated cross-checking and official review.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Fraud Risk Score
                </span>
                <span className="font-mono text-3xl font-bold text-slate-900">
                  {(score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold ${riskLevel?.color}`}>
                  {riskLevel?.label}
                </span>

                {isFlagged && (
                  <span className="inline-flex items-center rounded-full border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">
                    ⚠️ Flagged for Verification
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
              <span className="font-semibold text-slate-800 block">
                Verification Details:
              </span>
              <p>
                The WelfAI fraud detection system cross-references household income declaration with utility meter numbers and bank account activity to ensure fair distribution of Sri Lanka welfare funds.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudResultPage;
