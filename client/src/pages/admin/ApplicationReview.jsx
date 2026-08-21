import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApplicationById, markUnderReview, reviewApplication } from '../../api/adminApi';

const ApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form state
  const [decision, setDecision] = useState(''); // 'Approved' | 'Rejected'
  const [reviewNotes, setReviewNotes] = useState('');
  const [notesError, setNotesError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      // First attempt to mark as under review
      try {
        await markUnderReview(id);
      } catch (err) {
        console.warn('Could not mark as under review:', err);
      }

      // Then fetch full detail
      const res = await getApplicationById(id);
      if (res.success && res.data) {
        setApplication(res.data);
      }
    } catch (err) {
      console.error('Failed to load application detail:', err);
      setError(err.response?.data?.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const handleDecisionSelect = (selectedDecision) => {
    setDecision(selectedDecision);
    setNotesError('');
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    setNotesError('');

    if (!decision) {
      toast.error('Please select a review decision (Approve or Reject).');
      return;
    }

    if (decision === 'Rejected' && !reviewNotes.trim()) {
      setNotesError('Please provide a mandatory reason for rejecting this application.');
      toast.error('Review notes are required for rejection.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewApplication(id, decision, reviewNotes);
      if (res.success) {
        toast.success(`Application ${decision.toLowerCase()} successfully!`);
        navigate('/admin/review-queue');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      const errMsg = err.response?.data?.message || 'Failed to submit application review';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getDocUrl = (fileUrl) => {
    if (!fileUrl) return '#';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const serverOrigin = apiBase.replace(/\/api\/?$/, '');
    return `${serverOrigin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
        Loading application details for review...
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/review-queue"
          className="inline-flex items-center text-xs font-semibold text-teal-800 hover:underline"
        >
          ← Back to Review Queue
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

  const isDecided = application.status === 'Approved' || application.status === 'Rejected';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Link
            to="/admin/review-queue"
            className="inline-flex items-center text-xs font-semibold text-teal-800 hover:text-teal-950 hover:underline mb-1"
          >
            ← Back to Review Queue
          </Link>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Application Review: {pi.fullName || application.applicant?.fullName || 'Applicant'}
          </h1>
          <p className="text-xs text-slate-500">
            NIC: <span className="font-mono font-semibold text-slate-700">{pi.nicNumber || application.applicant?.nic || 'N/A'}</span> • Ref ID: {application._id}
          </p>
        </div>

        <div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
              application.status
            )}`}
          >
            Status: {application.status}
          </span>
        </div>
      </div>

      {/* If Already Reviewed Read-Only Banner */}
      {isDecided && (
        <div
          className={`rounded-xl border p-5 ${
            application.status === 'Approved'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-red-200 bg-red-50 text-red-950'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {application.status === 'Approved' ? '✅' : '❌'}
            </span>
            <h3 className="font-serif font-bold text-base">
              This Application Has Been Decided: {application.status}
            </h3>
          </div>
          <div className="mt-2 text-xs space-y-1">
            <p>
              <strong>Reviewed By:</strong> {application.reviewedBy?.fullName || 'Admin'} ({application.reviewedBy?.email || 'N/A'})
            </p>
            {application.reviewedAt && (
              <p>
                <strong>Reviewed On:</strong>{' '}
                {new Date(application.reviewedAt).toLocaleDateString('en-LK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            {application.reviewNotes && (
              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <strong className="block mb-0.5">Reviewer Notes / Reason:</strong>
                <p className="whitespace-pre-wrap rounded-lg bg-white/80 p-3 border border-slate-200 text-slate-800">
                  {application.reviewNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Verification Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-serif text-lg font-bold text-slate-900">
            Uploaded Verification Documents ({docs.length})
          </h2>
          <p className="text-xs text-slate-500">
            Inspect applicant-uploaded identity and verification supporting documents.
          </p>
        </div>

        {docs.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No documents attached to this application.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {docs.map((doc, idx) => (
              <div
                key={doc._id || idx}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="inline-block rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-900 mb-1">
                    {doc.documentType}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 truncate" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <a
                  href={getDocUrl(doc.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-teal-900 transition hover:bg-teal-50 shadow-sm"
                >
                  <span>View Document</span>
                  <span>↗</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8 Read-only Data Section Cards */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-slate-900 pt-2">
          Application Form Declarations
        </h2>

        {/* 1. Personal Info */}
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

        {/* 2. Household Info */}
        <ReadonlySectionCard title="2. Household Information">
          <DetailField label="Total Family Members" value={hi.numberOfFamilyMembers} />
          <DetailField label="Income Earners" value={hi.numberOfIncomeEarners} />
          <DetailField label="Children (<18)" value={hi.numberOfChildren} />
          <DetailField label="Elderly Dependents (>60)" value={hi.numberOfElderlyDependents} />
          <DetailField label="Differently Abled Members" value={hi.numberOfDisabledMembers} />
          <DetailField label="Monthly Expenses" value={hi.monthlyHouseholdExpenses !== undefined ? `LKR ${hi.monthlyHouseholdExpenses.toLocaleString()}` : ''} />
        </ReadonlySectionCard>

        {/* 3. Employment Info */}
        <ReadonlySectionCard title="3. Employment Information">
          <DetailField label="Employment Status" value={ei.employmentStatus} />
          <DetailField label="Employment Type" value={ei.employmentType} />
          <DetailField label="Occupation" value={ei.occupation} />
          <DetailField label="Employer Name" value={ei.employerName} />
          <DetailField label="Years of Employment" value={ei.yearsOfEmployment} />
        </ReadonlySectionCard>

        {/* 4. Income Info */}
        <ReadonlySectionCard title="4. Income Information">
          <DetailField label="Total Monthly Household Income" value={ii.totalMonthlyHouseholdIncome !== undefined ? `LKR ${ii.totalMonthlyHouseholdIncome.toLocaleString()}` : ''} />
          <DetailField label="Salary Income" value={`LKR ${(ii.salaryIncome || 0).toLocaleString()}`} />
          <DetailField label="Business Income" value={`LKR ${(ii.businessIncome || 0).toLocaleString()}`} />
          <DetailField label="Agricultural Income" value={`LKR ${(ii.agriculturalIncome || 0).toLocaleString()}`} />
          <DetailField label="Pension Income" value={`LKR ${(ii.pensionIncome || 0).toLocaleString()}`} />
          <DetailField label="Other Income" value={`LKR ${(ii.otherIncome || 0).toLocaleString()}`} />
        </ReadonlySectionCard>

        {/* 5. Education & Skills */}
        <ReadonlySectionCard title="5. Education & Vocational Skills">
          <DetailField label="Highest Qualification" value={ed.highestEducationalQualification} />
          <DetailField label="Vocational Training" value={ed.vocationalTraining} />
          <DetailField label="Professional Skills" value={ed.professionalSkills?.length ? ed.professionalSkills.join(', ') : 'None'} />
        </ReadonlySectionCard>

        {/* 6. Housing Info */}
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

        {/* 7. Asset Declaration */}
        <ReadonlySectionCard title="7. Asset Declaration">
          <DetailField label="Owns Motor Vehicle(s)" value={ad.ownsVehicle !== undefined ? (ad.ownsVehicle ? `Yes (${ad.numberOfVehicles || 1})` : 'No') : ''} />
          <DetailField label="Owns Property/Land" value={ad.ownsProperty !== undefined ? (ad.ownsProperty ? `Yes (${ad.numberOfProperties || 1})` : 'No') : ''} />
          <DetailField label="Owns Registered Business" value={ad.ownsBusiness !== undefined ? (ad.ownsBusiness ? 'Yes' : 'No') : ''} />
          <DetailField label="Owns Agricultural Land" value={ad.ownsAgriculturalLand !== undefined ? (ad.ownsAgriculturalLand ? 'Yes' : 'No') : ''} />
        </ReadonlySectionCard>

        {/* 8. Verification Details */}
        <ReadonlySectionCard title="8. External Verification Details">
          <DetailField label="Bank Name" value={vd.bankName} />
          <DetailField label="Bank Account Number" value={vd.bankAccountNumber} />
          <DetailField label="CEB/LECO Electricity Account" value={vd.electricityAccountNumber} />
          <DetailField label="Water Account Number" value={vd.waterAccountNumber} />
        </ReadonlySectionCard>
      </div>

      {/* Decision Panel (only rendered if application is not already decided) */}
      {!isDecided && (
        <form onSubmit={handleSubmitDecision} className="rounded-xl border border-teal-800 bg-slate-900 p-6 sm:p-8 text-white shadow-lg space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-white">
              Admin Review & Determination
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select your review determination below. Rejections require a clear explanation for the applicant.
            </p>
          </div>

          {/* Decision Selection Buttons */}
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
              <span>Approve Application</span>
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
              <span>Reject Application</span>
            </button>
          </div>

          {/* Review Notes Textarea */}
          {decision && (
            <div className="space-y-2 pt-2">
              <label htmlFor="review-notes" className="block text-xs font-semibold text-slate-200">
                Review Notes / Determination Explanation {decision === 'Rejected' && <span className="text-red-400">* Required for rejection</span>}
              </label>
              <textarea
                id="review-notes"
                rows={4}
                value={reviewNotes}
                onChange={(e) => {
                  setReviewNotes(e.target.value);
                  if (notesError) setNotesError('');
                }}
                placeholder={
                  decision === 'Rejected'
                    ? 'State the reason for rejecting this application (e.g., income threshold exceeded, unverified documents)...'
                    : 'Optional approval notes or comments for record keeping...'
                }
                className={`w-full rounded-xl border bg-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                  notesError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:ring-teal-500'
                }`}
              />
              {notesError && <p className="text-xs font-semibold text-red-400">{notesError}</p>}
            </div>
          )}

          {/* Submit Action Button */}
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
                ? 'Submitting Decision...'
                : decision
                ? `Confirm & ${decision} Application`
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

export default ApplicationReview;
