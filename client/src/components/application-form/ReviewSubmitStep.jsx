import { useState } from 'react';
import { toast } from 'react-toastify';
import { submitApplication } from '../../api/applicationApi';

const REQUIRED_DOC_TYPES = [
  'NIC Copy',
  'Income Certificate',
  'Electricity Bill',
  'Grama Niladhari Certificate',
];

const ReviewSubmitStep = ({ formData = {}, onEditStep, onSubmitSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  const pi = formData.personalInfo || {};
  const hi = formData.householdInfo || {};
  const ei = formData.employmentInfo || {};
  const ii = formData.incomeInfo || {};
  const ed = formData.educationSkills || {};
  const ho = formData.housingInfo || {};
  const ad = formData.assetDeclaration || {};
  const vd = formData.verificationDetails || {};
  const docs = formData.documents || [];

  // Check required documents status
  const uploadedDocTypes = docs.map((d) => d.documentType);
  const missingRequiredDocs = REQUIRED_DOC_TYPES.filter(
    (type) => !uploadedDocTypes.includes(type)
  );

  // Check required fields completeness
  const isPersonalComplete =
    !!pi.nicNumber &&
    !!pi.fullName &&
    !!pi.dateOfBirth &&
    !!pi.gender &&
    !!pi.maritalStatus &&
    !!pi.mobileNumber &&
    !!pi.address &&
    !!pi.district &&
    !!pi.dsDivision &&
    !!pi.gnDivision;

  const isHouseholdComplete =
    hi.numberOfFamilyMembers >= 1 &&
    hi.numberOfIncomeEarners >= 0 &&
    hi.numberOfChildren >= 0 &&
    hi.numberOfElderlyDependents >= 0 &&
    hi.numberOfDisabledMembers >= 0 &&
    hi.monthlyHouseholdExpenses >= 0;

  const isEmploymentComplete =
    !!ei.employmentStatus &&
    !!ei.employmentType &&
    (ei.employmentStatus === 'Unemployed' || !!ei.occupation);

  const isIncomeComplete =
    ii.totalMonthlyHouseholdIncome !== undefined &&
    ii.totalMonthlyHouseholdIncome !== null &&
    ii.totalMonthlyHouseholdIncome !== '';

  const isEducationComplete = !!ed.highestEducationalQualification;

  const isHousingComplete =
    !!ho.houseOwnership &&
    !!ho.houseType &&
    ho.numberOfRooms >= 1 &&
    !!ho.roofMaterial &&
    !!ho.wallMaterial &&
    !!ho.floorMaterial &&
    ho.accessToElectricity !== undefined &&
    ho.accessToCleanWater !== undefined &&
    !!ho.toiletFacilities;

  const isAssetsComplete =
    ad.ownsVehicle !== undefined &&
    ad.ownsProperty !== undefined &&
    ad.ownsBusiness !== undefined &&
    ad.ownsAgriculturalLand !== undefined;

  const isVerificationComplete =
    !!vd.bankName && !!vd.bankAccountNumber && !!vd.electricityAccountNumber;

  const isAllComplete =
    isPersonalComplete &&
    isHouseholdComplete &&
    isEmploymentComplete &&
    isIncomeComplete &&
    isEducationComplete &&
    isHousingComplete &&
    isAssetsComplete &&
    isVerificationComplete &&
    missingRequiredDocs.length === 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionError(null);
    try {
      const res = await submitApplication();
      if (res.success && res.data) {
        setSubmittedData(res.data);
        toast.success('Application submitted successfully!');
        if (onSubmitSuccess) onSubmitSuccess(res.data);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errMsg = err.response?.data?.message || 'Failed to submit application';
      setSubmissionError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmation View on Success
  if (submittedData) {
    return (
      <div className="py-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-800">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Application Submitted Successfully!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your welfare eligibility application has been recorded and submitted for review.
          </p>
          <div className="mt-4 inline-block rounded-lg border border-teal-200 bg-teal-50 px-6 py-3">
            <span className="text-xs uppercase tracking-wider text-teal-700 font-semibold block">
              Reference Application ID
            </span>
            <span className="font-mono text-lg font-bold text-teal-950">
              {submittedData._id}
            </span>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => (window.location.href = '/dashboard')}
            className="rounded-lg bg-teal-900 px-6 py-3 text-sm font-medium text-white shadow transition hover:bg-teal-800"
          >
            Go to Applicant Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Review & Submit Application
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Review all information entered across sections. Click "Edit" to modify any section before final submission.
        </p>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold block mb-1">Submission Could Not Proceed:</span>
          {submissionError}
        </div>
      )}

      {/* Required Documents Checklist Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <h4 className="font-serif text-base font-medium text-slate-900">
            Required Documents Checklist
          </h4>
          <button
            type="button"
            onClick={() => onEditStep(9)}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 hover:underline"
          >
            Manage Documents →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REQUIRED_DOC_TYPES.map((docType) => {
            const isUploaded = uploadedDocTypes.includes(docType);
            return (
              <div
                key={docType}
                className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-xs font-medium ${
                  isUploaded
                    ? 'border-teal-200 bg-white text-teal-900'
                    : 'border-red-200 bg-red-50/50 text-red-800'
                }`}
              >
                <span>{docType}</span>
                {isUploaded ? (
                  <span className="font-bold text-teal-700">✓ Uploaded</span>
                ) : (
                  <span className="font-bold text-red-600">✗ Missing</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summaries of 8 Sections */}
      <div className="space-y-6">
        {/* 1. Personal Info */}
        <SectionSummaryCard
          title="1. Personal Information"
          stepId={1}
          onEdit={onEditStep}
          isComplete={isPersonalComplete}
        >
          <SummaryField label="NIC Number" value={pi.nicNumber} />
          <SummaryField label="Full Name" value={pi.fullName} />
          <SummaryField label="Date of Birth" value={pi.dateOfBirth?.split('T')[0]} />
          <SummaryField label="Gender" value={pi.gender} />
          <SummaryField label="Marital Status" value={pi.maritalStatus} />
          <SummaryField label="Mobile Number" value={pi.mobileNumber} />
          <SummaryField label="Email" value={pi.email || 'N/A'} />
          <SummaryField label="Address" value={pi.address} />
          <SummaryField label="District" value={pi.district} />
          <SummaryField label="DS Division" value={pi.dsDivision} />
          <SummaryField label="GN Division" value={pi.gnDivision} />
        </SectionSummaryCard>

        {/* 2. Household Info */}
        <SectionSummaryCard
          title="2. Household Information"
          stepId={2}
          onEdit={onEditStep}
          isComplete={isHouseholdComplete}
        >
          <SummaryField label="Total Family Members" value={hi.numberOfFamilyMembers} />
          <SummaryField label="Income Earners" value={hi.numberOfIncomeEarners} />
          <SummaryField label="Children (<18)" value={hi.numberOfChildren} />
          <SummaryField label="Elderly Dependents (>60)" value={hi.numberOfElderlyDependents} />
          <SummaryField label="Differently Abled Members" value={hi.numberOfDisabledMembers} />
          <SummaryField label="Monthly Expenses" value={hi.monthlyHouseholdExpenses ? `LKR ${hi.monthlyHouseholdExpenses.toLocaleString()}` : ''} />
        </SectionSummaryCard>

        {/* 3. Employment Info */}
        <SectionSummaryCard
          title="3. Employment Information"
          stepId={3}
          onEdit={onEditStep}
          isComplete={isEmploymentComplete}
        >
          <SummaryField label="Employment Status" value={ei.employmentStatus} />
          <SummaryField label="Employment Type" value={ei.employmentType} />
          <SummaryField label="Occupation" value={ei.occupation || 'N/A'} />
          <SummaryField label="Employer Name" value={ei.employerName || 'N/A'} />
          <SummaryField label="Years of Employment" value={ei.yearsOfEmployment ?? 'N/A'} />
        </SectionSummaryCard>

        {/* 4. Income Info */}
        <SectionSummaryCard
          title="4. Income Information"
          stepId={4}
          onEdit={onEditStep}
          isComplete={isIncomeComplete}
        >
          <SummaryField label="Total Monthly Household Income" value={ii.totalMonthlyHouseholdIncome ? `LKR ${ii.totalMonthlyHouseholdIncome.toLocaleString()}` : ''} />
          <SummaryField label="Salary Income" value={`LKR ${(ii.salaryIncome || 0).toLocaleString()}`} />
          <SummaryField label="Business Income" value={`LKR ${(ii.businessIncome || 0).toLocaleString()}`} />
          <SummaryField label="Agricultural Income" value={`LKR ${(ii.agriculturalIncome || 0).toLocaleString()}`} />
          <SummaryField label="Pension Income" value={`LKR ${(ii.pensionIncome || 0).toLocaleString()}`} />
          <SummaryField label="Other Income" value={`LKR ${(ii.otherIncome || 0).toLocaleString()}`} />
        </SectionSummaryCard>

        {/* 5. Education & Skills */}
        <SectionSummaryCard
          title="5. Education & Vocational Skills"
          stepId={5}
          onEdit={onEditStep}
          isComplete={isEducationComplete}
        >
          <SummaryField label="Highest Qualification" value={ed.highestEducationalQualification} />
          <SummaryField label="Vocational Training" value={ed.vocationalTraining || 'None'} />
          <SummaryField label="Professional Skills" value={ed.professionalSkills?.length ? ed.professionalSkills.join(', ') : 'None'} />
        </SectionSummaryCard>

        {/* 6. Housing Info */}
        <SectionSummaryCard
          title="6. Housing & Living Conditions"
          stepId={6}
          onEdit={onEditStep}
          isComplete={isHousingComplete}
        >
          <SummaryField label="House Ownership" value={ho.houseOwnership} />
          <SummaryField label="House Type" value={ho.houseType} />
          <SummaryField label="Number of Rooms" value={ho.numberOfRooms} />
          <SummaryField label="Roof Material" value={ho.roofMaterial} />
          <SummaryField label="Wall Material" value={ho.wallMaterial} />
          <SummaryField label="Floor Material" value={ho.floorMaterial} />
          <SummaryField label="Electricity Grid Access" value={ho.accessToElectricity ? 'Yes' : 'No'} />
          <SummaryField label="Clean Water Access" value={ho.accessToCleanWater ? 'Yes' : 'No'} />
          <SummaryField label="Toilet Facilities" value={ho.toiletFacilities} />
        </SectionSummaryCard>

        {/* 7. Asset Declaration */}
        <SectionSummaryCard
          title="7. Asset Declaration"
          stepId={7}
          onEdit={onEditStep}
          isComplete={isAssetsComplete}
        >
          <SummaryField label="Owns Motor Vehicle(s)" value={ad.ownsVehicle ? `Yes (${ad.numberOfVehicles || 1})` : 'No'} />
          <SummaryField label="Owns Property/Land" value={ad.ownsProperty ? `Yes (${ad.numberOfProperties || 1})` : 'No'} />
          <SummaryField label="Owns Registered Business" value={ad.ownsBusiness ? 'Yes' : 'No'} />
          <SummaryField label="Owns Agricultural Land" value={ad.ownsAgriculturalLand ? 'Yes' : 'No'} />
        </SectionSummaryCard>

        {/* 8. Verification Details */}
        <SectionSummaryCard
          title="8. External Verification Details"
          stepId={8}
          onEdit={onEditStep}
          isComplete={isVerificationComplete}
        >
          <SummaryField label="Bank Name" value={vd.bankName} />
          <SummaryField label="Bank Account Number" value={vd.bankAccountNumber ? '••••••••' + vd.bankAccountNumber.slice(-4) : ''} />
          <SummaryField label="CEB/LECO Electricity Account" value={vd.electricityAccountNumber} />
          <SummaryField label="Water Account Number" value={vd.waterAccountNumber || 'N/A'} />
        </SectionSummaryCard>
      </div>

      {/* Final Submit Action Container */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="font-serif text-lg font-bold text-teal-950">
            Ready to Submit Application?
          </h4>
          <p className="text-xs text-teal-800 mt-0.5">
            By submitting, you certify that all declared information and documents are true and accurate.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isAllComplete || submitting}
          className="rounded-lg bg-teal-900 px-7 py-3 text-sm font-semibold text-white shadow transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
        >
          {submitting ? 'Submitting Application...' : 'Submit Application Now'}
        </button>
      </div>
    </div>
  );
};

const SectionSummaryCard = ({ title, stepId, onEdit, isComplete, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
      <div className="flex items-center space-x-2">
        <h4 className="font-serif text-base font-semibold text-slate-900">{title}</h4>
        {isComplete ? (
          <span className="text-xs font-semibold text-teal-700">✓ Complete</span>
        ) : (
          <span className="text-xs font-semibold text-amber-600">! Incomplete</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onEdit(stepId)}
        className="text-xs font-semibold text-teal-800 hover:text-teal-950 hover:underline flex items-center space-x-1"
      >
        <span>Edit</span>
        <span>✏️</span>
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">{children}</div>
  </div>
);

const SummaryField = ({ label, value }) => (
  <div className="py-1">
    <span className="block text-xs font-medium text-slate-500">{label}</span>
    <span className="text-xs font-semibold text-slate-800">
      {value !== undefined && value !== null && value !== '' ? String(value) : <span className="text-slate-400 font-normal">Not Provided</span>}
    </span>
  </div>
);

export default ReviewSubmitStep;
