import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummary } from '../../api/superAdminApi';
import LocationFilter from '../../components/superadmin/LocationFilter';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({});
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardSummary(activeFilters);
      if (res.success && res.data) {
        setSummaryData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard summary analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(filters);
  }, [filters, fetchSummary]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const total = summaryData?.totalApplicants || 0;
  const byStatus = summaryData?.byStatus || {};
  const appeals = summaryData?.appealOutcomes || {};
  const waitingList = summaryData?.waitingListOutcomes || {};
  const lpPipeline = summaryData?.lifestylePlanPipeline || {};
  const districtData = summaryData?.districtBreakdown || [];

  const approvedCount = byStatus.approved || 0;
  const rejectedCount = byStatus.rejected || 0;
  const reviewPendingCount = (byStatus.submitted || 0) + (byStatus.underReview || 0);

  const approvedRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;
  const rejectedRate = total > 0 ? Math.round((rejectedCount / total) * 100) : 0;

  // Active filter breadcrumbs
  const filterChips = [];
  if (filters.province) filterChips.push(`${filters.province} Province`);
  if (filters.district) filterChips.push(`${filters.district} District`);
  if (filters.dsDivision) filterChips.push(`${filters.dsDivision} DS`);
  if (filters.gnDivision) filterChips.push(`${filters.gnDivision} GN`);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Superadmin Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 font-serif text-xl font-bold text-white shadow">
              W
            </div>
            <div>
              <span className="font-serif text-lg font-bold leading-tight text-white block">
                WelfAI
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-teal-400">
                Super Admin Intelligence & Strategy
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-semibold text-white">
                {user?.fullName || 'Super Administrator'}
              </span>
              <span className="block text-[10px] text-teal-300">
                {user?.email || 'admin@welfai.gov.lk'} (Superadmin)
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/superadmin/profile')}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-teal-700/70 bg-teal-900/60 px-3 py-1.5 text-xs font-semibold text-teal-200 hover:bg-teal-800 hover:text-white transition shadow-sm"
              title="My Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>My Profile</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-950/50 hover:border-red-900 transition"
            >
              <span>🚪 Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome & Scope Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                National Welfare Scheme Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-teal-100 max-w-2xl">
                Comprehensive macro-level monitoring of beneficiary eligibility determinations, appeals resolution, benefit reallocations, and machine learning lifestyle success forecasts across Sri Lanka.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 sm:p-4 text-xs space-y-1 shrink-0">
              <span className="text-teal-300 font-semibold uppercase tracking-wider text-[10px] block">
                Current Geographic Scope
              </span>
              <p className="font-serif font-bold text-sm text-white">
                {filterChips.length > 0 ? filterChips.join(' › ') : 'System-Wide (All 9 Provinces)'}
              </p>
            </div>
          </div>
        </div>

        {/* 4-Tier Location Hierarchy Filter */}
        <LocationFilter onChange={handleFilterChange} disabled={loading} />

        {/* Loading Indicator */}
        {loading && !summaryData && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-400 animate-pulse">
              Aggregating geographic and pipeline metrics across the scheme...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <p className="font-semibold text-red-800 text-sm">Failed to Load Dashboard Data</p>
            <p className="text-xs text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => fetchSummary(filters)}
              className="inline-flex rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
            >
              Retry
            </button>
          </div>
        )}

        {/* Analytics Display */}
        {summaryData && (
          <>
            {total === 0 ? (
              /* Empty State for Narrow Filter with 0 Applicants */
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                  🗺️
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-800">
                  No Applications Found for this Area
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  There are currently no submitted or reviewed welfare applications matching the selected location hierarchy ({filterChips.join(' › ')}). Try widening or clearing your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top KPI Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Total Applicants */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <span>Total Applicants</span>
                      <span className="text-base">📋</span>
                    </div>
                    <p className="font-serif text-3xl font-bold text-slate-900">
                      {total.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      All non-draft applications in scope
                    </p>
                  </div>

                  {/* Approved */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                      <span>Approved Benefits</span>
                      <span className="text-base">✅</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <p className="font-serif text-3xl font-bold text-emerald-900">
                        {approvedCount.toLocaleString()}
                      </p>
                      <span className="text-xs font-semibold text-emerald-700">
                        ({approvedRate}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Eligible beneficiaries receiving welfare
                    </p>
                  </div>

                  {/* Rejected */}
                  <div className="rounded-xl border border-red-200 bg-red-50/40 p-5 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-red-800 text-xs font-semibold uppercase tracking-wider">
                      <span>Rejected Applications</span>
                      <span className="text-base">❌</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <p className="font-serif text-3xl font-bold text-red-900">
                        {rejectedCount.toLocaleString()}
                      </p>
                      <span className="text-xs font-semibold text-red-700">
                        ({rejectedRate}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-red-800">
                      Ineligible or disqualified declarations
                    </p>
                  </div>

                  {/* Under Review & Submitted */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-blue-800 text-xs font-semibold uppercase tracking-wider">
                      <span>Review Pipeline</span>
                      <span className="text-base">⏳</span>
                    </div>
                    <p className="font-serif text-3xl font-bold text-blue-900">
                      {reviewPendingCount.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-blue-800">
                      {byStatus.submitted || 0} submitted • {byStatus.underReview || 0} under review
                    </p>
                  </div>
                </div>

                {/* Secondary Operational Insights (Appeals, Waiting List, ML Predictions) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Appeals Operational Card */}
                  <div className="rounded-xl border border-purple-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                      <h3 className="font-serif text-sm font-bold text-purple-950 flex items-center space-x-1.5">
                        <span>⚖️</span>
                        <span>Appeals Determinations</span>
                      </h3>
                      <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                        {appeals.pendingReview || 0} Active
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-purple-50/50">
                        <span className="text-purple-900 font-medium">Appeals Upheld & Approved</span>
                        <span className="font-bold text-emerald-700">{appeals.approved || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-purple-50/50">
                        <span className="text-purple-900 font-medium">Appeals Dismissed / Rejected</span>
                        <span className="font-bold text-red-700">{appeals.rejected || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-purple-50/50">
                        <span className="text-purple-900 font-medium">Currently Under Review</span>
                        <span className="font-bold text-purple-800">{appeals.pendingReview || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Waiting List & Reallocation Operational Card */}
                  <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                      <h3 className="font-serif text-sm font-bold text-amber-950 flex items-center space-x-1.5">
                        <span>⏳</span>
                        <span>Waiting List & Reallocation</span>
                      </h3>
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        {waitingList.active || 0} In Queue
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-amber-50/50">
                        <span className="text-amber-900 font-medium">Currently Disqualified (On List)</span>
                        <span className="font-bold text-amber-800">{waitingList.active || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-amber-50/50">
                        <span className="text-amber-900 font-medium">Successfully Reinstated</span>
                        <span className="font-bold text-emerald-700">{waitingList.reinstated || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-amber-50/50">
                        <span className="text-amber-900 font-medium">Finally Rejected & Revoked</span>
                        <span className="font-bold text-red-700">{waitingList.rejected || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* ML Lifestyle Improvement Forecast Card */}
                  <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                      <h3 className="font-serif text-sm font-bold text-teal-950 flex items-center space-x-1.5">
                        <span>🌱</span>
                        <span>ML Lifestyle Forecast</span>
                      </h3>
                      <span className="text-[10px] font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200">
                        Threshold ≥ 60%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-600 block">
                          Applicants with 60%+ predicted success:
                        </span>
                        <p className="font-serif text-2xl font-bold text-teal-950 mt-0.5">
                          {summaryData.predictedSuccessCount || 0} Applicants
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-teal-100/60 text-xs">
                        <div className="p-2 rounded bg-white border border-teal-100">
                          <span className="text-[10px] text-slate-500 block">Avg Success Prob</span>
                          <span className="font-bold text-teal-900">
                            {summaryData.averageSuccessProbability !== null
                              ? `${summaryData.averageSuccessProbability}%`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-white border border-teal-100">
                          <span className="text-[10px] text-slate-500 block">Avg Est Duration</span>
                          <span className="font-bold text-teal-900">
                            {summaryData.averageEstimatedDurationMonths !== null
                              ? `${summaryData.averageEstimatedDurationMonths} months`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lifestyle Improvement Plan Pipeline Bar */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <h3 className="font-serif text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Lifestyle Improvement Plan Execution Pipeline
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <span className="text-xs text-slate-500 block">Not Started</span>
                      <span className="font-serif text-xl font-bold text-slate-800">
                        {lpPipeline.notStarted || 0}
                      </span>
                    </div>
                    <div className="rounded-lg bg-blue-50/50 p-3 border border-blue-100">
                      <span className="text-xs text-blue-700 block">Plan Submitted</span>
                      <span className="font-serif text-xl font-bold text-blue-900">
                        {lpPipeline.submitted || 0}
                      </span>
                    </div>
                    <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-100">
                      <span className="text-xs text-amber-700 block">Under Review</span>
                      <span className="font-serif text-xl font-bold text-amber-900">
                        {lpPipeline.underReview || 0}
                      </span>
                    </div>
                    <div className="rounded-lg bg-emerald-50/50 p-3 border border-emerald-100">
                      <span className="text-xs text-emerald-700 block">ML Assessed</span>
                      <span className="font-serif text-xl font-bold text-emerald-900">
                        {lpPipeline.mlAssessed || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Geographic District Breakdown with Recharts */}
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-base font-bold text-slate-900">
                          District-Wise Application & Eligibility Distribution
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Comparison of total applications, approved determinations, and rejected applications across districts in scope
                        </p>
                      </div>
                    </div>

                    {districtData.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-6 text-center">
                        No district breakdown data available.
                      </p>
                    ) : (
                      <>
                        {/* Interactive Recharts Bar Chart */}
                        <div className="h-72 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={districtData}
                              margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis
                                dataKey="district"
                                angle={-35}
                                textAnchor="end"
                                interval={0}
                                tick={{ fontSize: 11, fill: '#475569' }}
                              />
                              <YAxis tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#0F172A',
                                  borderRadius: '8px',
                                  border: 'none',
                                  color: '#fff',
                                  fontSize: '12px',
                                }}
                              />
                              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                              <Bar dataKey="totalApplicants" name="Total Applicants" fill="#0D9488" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="approved" name="Approved" fill="#10B981" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="rejected" name="Rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* District Breakdown Table */}
                        <div className="overflow-x-auto rounded-lg border border-slate-100 pt-2">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              <tr>
                                <th className="p-3">District</th>
                                <th className="p-3 text-right">Total Applicants</th>
                                <th className="p-3 text-right">Approved</th>
                                <th className="p-3 text-right">Rejected</th>
                                <th className="p-3 text-right">Approval Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {districtData.map((d) => {
                                const rate =
                                  d.totalApplicants > 0
                                    ? Math.round((d.approved / d.totalApplicants) * 100)
                                    : 0;
                                return (
                                  <tr key={d.district} className="hover:bg-slate-50/60 transition">
                                    <td className="p-3 font-semibold text-slate-800">
                                      {d.district}
                                    </td>
                                    <td className="p-3 text-right font-medium text-slate-700">
                                      {d.totalApplicants.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right font-semibold text-emerald-700">
                                      {d.approved.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right font-semibold text-red-700">
                                      {d.rejected.toLocaleString()}
                                    </td>
                                    <td className="p-3 text-right font-bold text-slate-800">
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${
                                          rate >= 50
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {rate}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
