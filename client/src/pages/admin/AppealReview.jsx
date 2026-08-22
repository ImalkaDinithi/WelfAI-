import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApplicationById, reviewAppeal } from '../../api/adminApi';

const AppealReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [decision, setDecision] = useState(''); // 'Approved' | 'Rejected'
  const [reviewNotes, setReviewNotes] = useState('');
  const [notesError, setNotesError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getApplicationById(id);
        if (res.success && res.data) {
          setApplication(res.data);
        }
      } catch (err) {
        console.error('Failed to load application detail:', err);
        setError(err.response?.data?.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchApp();
  }, [id]);

  const handleDecisionSelect = (selectedDecision) => {
    setDecision(selectedDecision);
    setNotesError('');
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    setNotesError('');

    if (!decision) {
      toast.error('Please select an appeal determination decision.');
      return;
    }

    if (!reviewNotes.trim()) {
      setNotesError('Please provide a mandatory explanation for your appeal determination.');
      toast.error('Review notes are required for appeal determinations.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewAppeal(id, decision, reviewNotes);
      if (res.success) {
        toast.success(`Appeal ${decision.toLowerCase()} successfully!`);
        navigate('/admin/appeal-queue');
      }
    } catch (err) {
      console.error('Appeal review submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit appeal review');
    } finally {
      setSubmitting(false);
    }
  };

  const getDocUrl = (fileUrl) => {
    if (!fileUrl) return '#';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const serverOrigin = apiBase.replace(/\/api\/?$/, '');
    return `${serverOrigin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400 animate-pulse">Loading appeal details for review...</div>;
  }

  if (error || !application) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/appeal-queue" className="text-xs font-semibold text-teal-800 hover:underline">
          ← Back to Appeals Queue
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
          {error || 'Application not found'}
        </div>
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
  const docs = application.documents || [];
  const appeal = application.appeal || {};
  const appealDocs = appeal.documents || [];

  const isAppealDecided = !!appeal.decision || (application.status !== 'Appealed' && application.status !== 'Submitted' && application.status !== 'Under Review');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link to="/admin/appeal-queue" className="text-xs font-semibold text-teal-800 hover:underline mb-1 inline-block">
            ← Back to Appeals Queue
          </Link>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Appeal Determination: {pi.fullName || application.applicant?.fullName || 'Applicant'}
          </h1>
          <p className="text-xs text-slate-500">
            NIC: <span className="font-mono font-semibold text-slate-700">{pi.nicNumber || application.applicant?.nic || 'N/A'}</span> • Ref ID: {application._id}
          </p>
        </div>

        <div>
          <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
            Status: {application.status}
          </span>
        </div>
      </div>

      {/* If Appeal Already Decided Read-Only Banner */}
      {isAppealDecided && (
        <div
          className={`rounded-xl border p-5 ${
            appeal.decision === 'Approved' || application.status === 'Approved'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-red-200 bg-red-50 text-red-950'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {appeal.decision === 'Approved' || application.status === 'Approved' ? '✅' : '❌'}
            </span>
            <h3 className="font-serif font-bold text-base">
              Appeal Ruling: {appeal.decision || application.status}
            </h3>
          </div>
          <div className="mt-2 text-xs space-y-1">
            <p>
              <strong>Appeal Reviewed By:</strong> {appeal.reviewedBy?.fullName || application.reviewedBy?.fullName || 'Admin'}
            </p>
            {appeal.reviewedAt && (
              <p>
                <strong>Appeal Reviewed On:</strong>{' '}
                {new Date(appeal.reviewedAt).toLocaleDateString('en-LK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            {appeal.reviewNotes && (
              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <strong className="block mb-0.5">Appeal Ruling Notes:</strong>
                <p className="whitespace-pre-wrap rounded-lg bg-white/80 p-3 border border-slate-200 text-slate-800">
                  {appeal.reviewNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applicant Appeal Submission Detail Card */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-6 shadow-sm space-y-4">
        <div className="border-b border-purple-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-purple-950">
              Submitted Appeal Details
            </h2>
            <p className="text-xs text-purple-700">
              Submitted on {appeal.submittedAt ? new Date(appeal.submittedAt).toLocaleDateString('en-LK') : 'N/A'}
            </p>
          </div>
          <span className="rounded-full bg-purple-200 px-3 py-1 text-xs font-semibold text-purple-900">
            Contact Preference: {appeal.contactPreference || 'Email'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-semibold text-purple-900 block text-xs">Grounds for Appeal:</span>
            <span className="font-medium text-slate-800 text-sm">{appeal.groundsForAppeal || 'N/A'}</span>
          </div>

          <div>
            <span className="font-semibold text-purple-900 block text-xs">Appeal Statement:</span>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-4 border border-purple-200 text-slate-800 font-medium">
              {appeal.appealText || 'No explanation text provided.'}
            </p>
          </div>
        </div>

        {/* Appeal Evidence Documents */}
        <div className="pt-2">
          <h3 className="font-serif text-xs font-bold text-purple-950 mb-2">
            Appeal Evidence Documents ({appealDocs.length})
          </h3>
          {appealDocs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No additional appeal evidence files attached.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {appealDocs.map((doc, idx) => (
                <div key={doc._id || idx} className="rounded-lg border border-purple-200 bg-white p-3 flex justify-between items-center text-xs">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-900 block truncate">{doc.fileName}</span>
                    <span className="text-[10px] text-slate-500">{doc.documentType}</span>
                  </div>
                  <a
                    href={getDocUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 rounded bg-teal-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-teal-800 shrink-0"
                  >
                    <span>View</span>
                    <span>↗</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Original Rejection History Card */}
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-5 shadow-sm space-y-2">
        <h3 className="font-serif text-sm font-bold text-red-950 flex items-center space-x-2">
          <span>❌</span>
          <span>Original Rejection Audit Record</span>
        </h3>
        <div className="text-xs space-y-1 text-red-900">
          <p><strong>Reviewed By:</strong> {application.reviewedBy?.fullName || 'Admin'} ({application.reviewedBy?.email || 'N/A'})</p>
          {application.reviewedAt && <p><strong>Rejection Date:</strong> {new Date(application.reviewedAt).toLocaleDateString('en-LK')}</p>}
          <div>
            <strong>Original Rejection Reason:</strong>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white/80 p-3 border border-red-200 text-slate-800">
              {application.reviewNotes || 'No notes available'}
            </p>
          </div>
        </div>
      </div>

      {/* Original Application Declarations (8 Read-only Sections) */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-slate-900 pt-2">
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
          <DetailField label="Bank Name" value={vd.bankName} />
          <DetailField label="Bank Account Number" value={vd.bankAccountNumber} />
          <DetailField label="CEB/LECO Electricity Account" value={vd.electricityAccountNumber} />
          <DetailField label="Water Account Number" value={vd.waterAccountNumber} />
        </ReadonlySectionCard>

        {/* Original Documents */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h3 className="font-serif text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Original Application Documents ({docs.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {docs.map((doc, idx) => (
              <div key={doc._id || idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex justify-between items-center text-xs">
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-900 block truncate">{doc.fileName}</span>
                  <span className="text-[10px] text-slate-500">{doc.documentType}</span>
                </div>
                <a
                  href={getDocUrl(doc.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-teal-800 hover:underline shrink-0"
                >
                  View ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appeal Decision Action Panel */}
      {!isAppealDecided && (
        <form onSubmit={handleSubmitDecision} className="rounded-xl border border-teal-800 bg-slate-900 p-6 sm:p-8 text-white shadow-lg space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-white">
              Appeals Committee Determination Ruling
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select your determination ruling on this appeal. You must provide a formal explanation for your ruling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleDecisionSelect('Approved')}
              className={`flex items-center justify-center space-x-2 rounded-xl p-4 border font-semibold text-sm transition ${
                decision === 'Approved'
                  ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 ring-2 ring-emerald-500'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">✅</span>
              <span>Approve Appeal (Grant Welfare Status)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDecisionSelect('Rejected')}
              className={`flex items-center justify-center space-x-2 rounded-xl p-4 border font-semibold text-sm transition ${
                decision === 'Rejected'
                  ? 'border-red-500 bg-red-950/80 text-red-300 ring-2 ring-red-500'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">❌</span>
              <span>Reject Appeal (Uphold Rejection)</span>
            </button>
          </div>

          {decision && (
            <div className="space-y-2 pt-2">
              <label htmlFor="appeal-review-notes" className="block text-xs font-semibold text-slate-200">
                Appeal Determination Explanation <span className="text-red-400">* Required</span>
              </label>
              <textarea
                id="appeal-review-notes"
                rows={4}
                value={reviewNotes}
                onChange={(e) => {
                  setReviewNotes(e.target.value);
                  if (notesError) setNotesError('');
                }}
                placeholder={
                  decision === 'Approved'
                    ? 'State the reasons for overturning the original decision and approving this appeal...'
                    : 'State the reasons for upholding the original rejection after reviewing the appeal statement and evidence...'
                }
                className={`w-full rounded-xl border bg-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                  notesError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-teal-500'
                }`}
              />
              {notesError && <p className="text-xs font-semibold text-red-400">{notesError}</p>}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || !decision}
              className={`rounded-lg px-8 py-3 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-40 ${
                decision === 'Approved'
                  ? 'bg-emerald-700 hover:bg-emerald-600'
                  : decision === 'Rejected'
                  ? 'bg-red-700 hover:bg-red-600'
                  : 'bg-teal-900 hover:bg-teal-800'
              }`}
            >
              {submitting
                ? 'Submitting Ruling...'
                : decision
                ? `Confirm & ${decision} Appeal`
                : 'Select Decision First'}
            </button>
          </div>
        </form>
      )}
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

export default AppealReview;
