import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApplicationById, getPlanProgress, resolveWaitingList } from '../../api/adminApi';

const WaitingListReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [resolvedNotes, setResolvedNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const appRes = await getApplicationById(id);
        if (appRes.success && appRes.data) {
          setApplication(appRes.data);
        }

        // Fetch plan progress if lifestyle plan exists
        if (appRes.data?.lifestylePlan) {
          const planRes = await getPlanProgress(id);
          if (planRes.success && planRes.data) {
            setPlanData(planRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load waiting list details:', err);
        setError(err.response?.data?.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleResolve = async (decision) => {
    if (!resolvedNotes.trim()) {
      toast.error('Please enter notes explaining the resolution.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resolveWaitingList(id, decision, resolvedNotes);
      if (res.success) {
        toast.success(`Applicant successfully ${decision === 'Reinstated' ? 'reinstated' : 'rejected'}.`);
        navigate('/admin/waiting-list-queue');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || `Failed to ${decision.toLowerCase()} applicant.`);
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400 animate-pulse">Loading benefit review...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm mx-auto my-12">
        <p className="font-semibold text-red-800 mb-2">Error Loading Benefit</p>
        <p className="text-xs text-red-700">{error || 'Record not found'}</p>
        <Link
          to="/admin/waiting-list-queue"
          className="mt-4 inline-flex items-center rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white"
        >
          &larr; Back to Queue
        </Link>
      </div>
    );
  }

  const pi = application.personalInfo || {};
  const hi = application.householdInfo || {};
  const ei = application.employmentInfo || {};
  const ii = application.incomeInfo || {};
  const ed = application.educationSkills || {};
  const ho = application.housingInfo || {};
  const ad = application.assetDeclaration || {};
  const vd = application.verificationDetails || {};

  const info = application.waitingListInfo || {};
  const isResolved = Boolean(info.resolution);

  const periods = planData?.periods || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <Link
          to="/admin/waiting-list-queue"
          className="text-xs text-teal-300 hover:text-white mb-3 inline-flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span>Back to Waiting List Queue</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-1">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Waiting List Benefit Review
            </h1>
            <p className="mt-1 text-sm text-teal-100">
              Reference ID: {application._id} • Status: <span className="font-semibold">{application.status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Disqualification Reason Summary */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm space-y-3">
        <h3 className="font-serif text-sm font-bold text-amber-950 flex items-center space-x-2">
          <span>⏳</span>
          <span>Waiting List Disqualification Record</span>
        </h3>
        <div className="text-xs space-y-1.5 text-amber-900">
          <p><strong>Disqualified By:</strong> {info.disqualifiedBy?.fullName || 'Admin'} ({info.disqualifiedBy?.email || 'N/A'})</p>
          <p><strong>Disqualification Date:</strong> {formatDate(info.disqualifiedAt)}</p>
          <div>
            <strong>Reason for Disqualification:</strong>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 border border-amber-200 text-slate-800">
              {info.reason || 'No notes available'}
            </p>
          </div>
        </div>
      </div>

      {/* Resolution Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
          <span>🔧</span>
          <span>Waiting List Resolution Status</span>
        </h3>

        {isResolved ? (
          <div className="text-xs space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">Resolution Decision:</span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                info.resolution === 'Reinstated' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                {info.resolution}
              </span>
            </div>
            <p><strong>Resolved By:</strong> {info.resolvedBy?.fullName || 'Admin'} ({info.resolvedBy?.email || 'N/A'})</p>
            <p><strong>Resolution Date:</strong> {formatDate(info.resolvedAt)}</p>
            <div>
              <strong>Resolution Notes:</strong>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3 border border-slate-200 text-slate-800 font-medium">
                {info.resolvedNotes}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="resolved-notes" className="text-xs font-bold text-slate-700 block">
                Resolution Explanation Notes (Required)
              </label>
              <textarea
                id="resolved-notes"
                rows={4}
                value={resolvedNotes}
                onChange={(e) => setResolvedNotes(e.target.value)}
                placeholder="Provide notes detailing the reason for reinstatement or final rejection..."
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none bg-slate-50/30"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleResolve('Rejected')}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition shadow-sm disabled:opacity-50"
              >
                Reject Applicant
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleResolve('Reinstated')}
                className="rounded-lg bg-teal-900 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 transition shadow-sm disabled:opacity-50"
              >
                Reinstate Benefit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress timeline during waiting list */}
      {application.lifestylePlan && (
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
            Lifestyle Plan Progress Timeline
          </h2>
          {periods.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-white border border-slate-200 rounded-lg p-6 text-center">
              No plan progress records found.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {periods.map((period) => {
                const isReviewed = period.reviewStatus === 'Reviewed';
                const docs = period.documents || [];
                return (
                  <div
                    key={period.periodLabel}
                    className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                      isReviewed ? 'border-emerald-100 bg-emerald-50/5' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2 mb-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-sm font-bold text-slate-900">
                          {period.periodLabel}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                          isReviewed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {period.reviewStatus}
                        </span>
                      </div>
                      {isReviewed && period.reviewedAt && (
                        <span className="text-[10px] text-slate-500">
                          Reviewed on {formatDate(period.reviewedAt)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Side: Uploaded Documents */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Submitted Evidence
                        </span>
                        {docs.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic bg-slate-50 rounded p-3 text-center border border-dashed border-slate-150">
                            No evidence uploaded for this period.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {docs.map((doc) => (
                              <div
                                key={doc._id}
                                className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2 text-[11px]"
                              >
                                <div>
                                  <span className="font-semibold text-slate-800 block truncate max-w-[180px]" title={doc.fileName}>
                                    {doc.fileName}
                                  </span>
                                  <span className="text-[9px] text-slate-500">
                                    {doc.documentType} • {formatDate(doc.uploadedAt)}
                                  </span>
                                </div>
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-teal-800 hover:text-teal-900 shrink-0 ml-2"
                                >
                                  View File &rarr;
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Side: Notes */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Review Feedback
                        </span>
                        {period.reviewNotes ? (
                          <p className="p-3 bg-slate-50 rounded border border-slate-100 text-slate-700 whitespace-pre-wrap">
                            {period.reviewNotes}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic bg-slate-50 rounded p-3 text-center">
                            No review notes provided.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Declarations (8 Read-only Sections) */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-slate-900 pt-2 border-b border-slate-200 pb-2">
          Original Application Declarations
        </h2>

        <ReadonlySectionCard title="1. Personal Information">
          <DetailField label="NIC Number" value={pi.nicNumber} />
          <DetailField label="Full Name" value={pi.fullName} />
          <DetailField label="Date of Birth" value={pi.dateOfBirth?.split('T')[0]} />
          <DetailField label="Gender" value={pi.gender} />
          <DetailField label="Marital Status" value={pi.maritalStatus} />
          <DetailField label="Mobile Number" value={pi.mobileNumber} />
          <DetailField label="Email" value={pi.email} />
          <DetailField label="Address" value={pi.address} />
          <DetailField label="District" value={pi.district} />
          <DetailField label="DS Division" value={pi.dsDivision} />
          <DetailField label="GN Division" value={pi.gnDivision} />
        </ReadonlySectionCard>

        <ReadonlySectionCard title="2. Household Information">
          <DetailField label="Total Family Members" value={hi.numberOfFamilyMembers} />
          <DetailField label="Income Earners" value={hi.numberOfIncomeEarners} />
          <DetailField label="Children (<18)" value={hi.numberOfChildren} />
          <DetailField label="Elderly Dependents (>60)" value={hi.numberOfElderlyDependents} />
          <DetailField label="Differently Abled Members" value={hi.numberOfDisabledMembers} />
          <DetailField label="Monthly Expenses" value={hi.monthlyHouseholdExpenses !== undefined ? `LKR ${hi.monthlyHouseholdExpenses.toLocaleString()}` : ''} />
        </ReadonlySectionCard>

        <ReadonlySectionCard title="3. Employment Information">
          <DetailField label="Employment Status" value={ei.employmentStatus} />
          <DetailField label="Employment Type" value={ei.employmentType} />
          <DetailField label="Occupation" value={ei.occupation} />
          <DetailField label="Employer Name" value={ei.employerName} />
          <DetailField label="Years of Employment" value={ei.yearsOfEmployment} />
        </ReadonlySectionCard>

        <ReadonlySectionCard title="4. Income Information">
          <DetailField label="Total Monthly Household Income" value={ii.totalMonthlyHouseholdIncome !== undefined ? `LKR ${ii.totalMonthlyHouseholdIncome.toLocaleString()}` : ''} />
          <DetailField label="Salary Income" value={`LKR ${(ii.salaryIncome || 0).toLocaleString()}`} />
          <DetailField label="Business Income" value={`LKR ${(ii.businessIncome || 0).toLocaleString()}`} />
          <DetailField label="Agricultural Income" value={`LKR ${(ii.agriculturalIncome || 0).toLocaleString()}`} />
          <DetailField label="Pension Income" value={`LKR ${(ii.pensionIncome || 0).toLocaleString()}`} />
          <DetailField label="Other Income" value={`LKR ${(ii.otherIncome || 0).toLocaleString()}`} />
        </ReadonlySectionCard>

        <ReadonlySectionCard title="5. Education & Vocational Skills">
          <DetailField label="Highest Qualification" value={ed.highestEducationalQualification} />
          <DetailField label="Vocational Training" value={ed.vocationalTraining} />
          <DetailField label="Professional Skills" value={ed.professionalSkills?.length ? ed.professionalSkills.join(', ') : 'None'} />
        </ReadonlySectionCard>

        <ReadonlySectionCard title="6. Housing & Living Conditions">
          <DetailField label="House Ownership" value={ho.houseOwnership} />
          <DetailField label="House Type" value={ho.houseType} />
          <DetailField label="Number of Rooms" value={ho.numberOfRooms} />
          <DetailField label="Roof Material" value={ho.roofMaterial} />
          <DetailField label="Wall Material" value={ho.wallMaterial} />
          <DetailField label="Floor Material" value={ho.floorMaterial} />
          <DetailField label="Electricity Grid Access" value={ho.accessToElectricity !== undefined ? (ho.accessToElectricity ? 'Yes' : 'No') : ''} />
          <DetailField label="Clean Water Access" value={ho.accessToCleanWater !== undefined ? (ho.accessToCleanWater ? 'Yes' : 'No') : ''} />
          <DetailField label="Toilet Facilities" value={ho.toiletFacilities} />
        </ReadonlySectionCard>

        <ReadonlySectionCard title="7. Asset Declaration">
          <DetailField label="Owns Motor Vehicle(s)" value={ad.ownsVehicle !== undefined ? (ad.ownsVehicle ? `Yes (${ad.numberOfVehicles || 1})` : 'No') : ''} />
          <DetailField label="Owns Property/Land" value={ad.ownsProperty !== undefined ? (ad.ownsProperty ? `Yes (${ad.numberOfProperties || 1})` : 'No') : ''} />
          <DetailField label="Owns Registered Business" value={ad.ownsBusiness !== undefined ? (ad.ownsBusiness ? 'Yes' : 'No') : ''} />
          <DetailField label="Owns Agricultural Land" value={ad.ownsAgriculturalLand !== undefined ? (ad.ownsAgriculturalLand ? 'Yes' : 'No') : ''} />
        </ReadonlySectionCard>

        <ReadonlySectionCard title="8. Verification Details">
          <DetailField label="Verification Status" value={vd.status} />
          <DetailField label="Grama Niladhari Verification" value={vd.gnStatus} />
          <DetailField label="Field Officer Verification" value={vd.foStatus} />
        </ReadonlySectionCard>
      </div>
    </div>
  );
};

const ReadonlySectionCard = ({ title, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="font-serif text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
      {children}
    </div>
  </div>
);

const DetailField = ({ label, value }) => (
  <div className="py-1">
    <span className="block text-xs font-medium text-slate-500">{label}</span>
    <span className="text-xs font-semibold text-slate-800">
      {value !== undefined && value !== null && value !== '' ? (
        String(value)
      ) : (
        <span className="text-slate-400 font-normal">Not Provided</span>
      )}
    </span>
  </div>
);

export default WaitingListReview;
