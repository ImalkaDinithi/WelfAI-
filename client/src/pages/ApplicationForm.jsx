import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyApplication, saveDraft } from '../api/applicationApi';
import { validateStep } from '../utils/applicationValidation';

import PersonalInfoStep from '../components/application-form/PersonalInfoStep';
import HouseholdInfoStep from '../components/application-form/HouseholdInfoStep';
import EmploymentInfoStep from '../components/application-form/EmploymentInfoStep';
import IncomeInfoStep from '../components/application-form/IncomeInfoStep';
import EducationSkillsStep from '../components/application-form/EducationSkillsStep';
import HousingInfoStep from '../components/application-form/HousingInfoStep';
import AssetDeclarationStep from '../components/application-form/AssetDeclarationStep';
import VerificationDetailsStep from '../components/application-form/VerificationDetailsStep';
import DocumentsStep from '../components/application-form/DocumentsStep';
import ReviewSubmitStep from '../components/application-form/ReviewSubmitStep';

const STEPS = [
  { id: 1, key: 'personalInfo', title: 'Personal Info' },
  { id: 2, key: 'householdInfo', title: 'Household' },
  { id: 3, key: 'employmentInfo', title: 'Employment' },
  { id: 4, key: 'incomeInfo', title: 'Income' },
  { id: 5, key: 'educationSkills', title: 'Education' },
  { id: 6, key: 'housingInfo', title: 'Housing' },
  { id: 7, key: 'assetDeclaration', title: 'Assets' },
  { id: 8, key: 'verificationDetails', title: 'Verification' },
  { id: 9, key: 'documents', title: 'Documents' },
  { id: 10, key: 'review', title: 'Review & Submit' },
];

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  const [formData, setFormData] = useState({
    personalInfo: {},
    householdInfo: {},
    employmentInfo: {},
    incomeInfo: {},
    educationSkills: {},
    housingInfo: {},
    assetDeclaration: {},
    verificationDetails: {},
    documents: [],
  });

  const [errors, setErrors] = useState({});

  // Fetch active application draft on mount
  useEffect(() => {
    const loadApplication = async () => {
      try {
        const response = await getMyApplication();
        if (response.success && response.data) {
          const app = response.data;
          setApplicationId(app._id);
          setFormData((prev) => ({
            ...prev,
            personalInfo: app.personalInfo || {},
            householdInfo: app.householdInfo || {},
            employmentInfo: app.employmentInfo || {},
            incomeInfo: app.incomeInfo || {},
            educationSkills: app.educationSkills || {},
            housingInfo: app.housingInfo || {},
            assetDeclaration: app.assetDeclaration || {},
            verificationDetails: app.verificationDetails || {},
            documents: app.documents || [],
          }));
        }
      } catch (err) {
        console.error('Failed to load application draft:', err);
        toast.error('Failed to load saved application data');
      } finally {
        setLoading(false);
      }
    };
    loadApplication();
  }, []);

  const handleSectionChange = (sectionKey, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldName]: value,
      },
    }));

    // Clear error for field if present
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const isStepValid = (stepId) => {
    if (stepId >= 1 && stepId <= 8) {
      const stepErrors = validateStep(stepId, formData);
      return Object.keys(stepErrors).length === 0;
    }
    return true;
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    if (currentStep >= 1 && currentStep <= 8) {
      const stepErrors = validateStep(currentStep, formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        toast.error('Please fix validation errors before proceeding');
        const firstKey = Object.keys(stepErrors)[0];
        setTimeout(() => {
          const el = document.querySelector(`[name="${firstKey}"], [id="${firstKey}"]`);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }
    }

    setErrors({});

    const stepConfig = STEPS.find((s) => s.id === currentStep);
    if (!stepConfig) return;

    // Autosave step data
    if (stepConfig.key !== 'review' && stepConfig.key !== 'documents') {
      setSavingDraft(true);
      try {
        const sectionData = {
          [stepConfig.key]: formData[stepConfig.key],
        };
        const res = await saveDraft(sectionData);
        if (res.data?._id) {
          setApplicationId(res.data._id);
        }
        toast.success(`${stepConfig.title} draft saved`, {
          autoClose: 1500,
          hideProgressBar: true,
        });
      } catch (err) {
        console.error('Autosave warning:', err);
        toast.warn('Autosave failed, but you can continue');
      } finally {
        setSavingDraft(false);
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-3 text-teal-800">
          <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="font-medium">Loading application form...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Sri Lanka Welfare Scheme Application
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Complete all 9 sections and upload required documents to submit your eligibility application.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 overflow-x-auto pb-2">
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (isCompleted) {
                      setErrors({});
                      setCurrentStep(step.id);
                    }
                  }}
                  disabled={!isCompleted && !isCurrent}
                  className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    isCurrent
                      ? 'bg-teal-900 text-white'
                      : isCompleted
                      ? 'bg-teal-50 text-teal-800 hover:bg-teal-100 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      isCurrent
                        ? 'bg-white text-teal-900 font-bold'
                        : isCompleted
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : step.id}
                  </span>
                  <span className="whitespace-nowrap">{step.title}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-teal-800 transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Form Container */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {currentStep === 1 && (
            <PersonalInfoStep
              data={formData.personalInfo}
              onChange={(field, val) => handleSectionChange('personalInfo', field, val)}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <HouseholdInfoStep
              data={formData.householdInfo}
              onChange={(field, val) => handleSectionChange('householdInfo', field, val)}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <EmploymentInfoStep
              data={formData.employmentInfo}
              onChange={(field, val) => handleSectionChange('employmentInfo', field, val)}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <IncomeInfoStep
              data={formData.incomeInfo}
              onChange={(field, val) => handleSectionChange('incomeInfo', field, val)}
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <EducationSkillsStep
              data={formData.educationSkills}
              onChange={(field, val) => handleSectionChange('educationSkills', field, val)}
              errors={errors}
            />
          )}

          {currentStep === 6 && (
            <HousingInfoStep
              data={formData.housingInfo}
              onChange={(field, val) => handleSectionChange('housingInfo', field, val)}
              errors={errors}
            />
          )}

          {currentStep === 7 && (
            <AssetDeclarationStep
              data={formData.assetDeclaration}
              onChange={(field, val) => handleSectionChange('assetDeclaration', field, val)}
              errors={errors}
            />
          )}

          {currentStep === 8 && (
            <VerificationDetailsStep
              data={formData.verificationDetails}
              onChange={(field, val) => handleSectionChange('verificationDetails', field, val)}
              errors={errors}
            />
          )}

          {currentStep === 9 && (
            <DocumentsStep
              applicationId={applicationId}
              documents={formData.documents}
              onChange={(docs) => setFormData((prev) => ({ ...prev, documents: docs }))}
            />
          )}

          {currentStep === 10 && (
            <ReviewSubmitStep
              formData={formData}
              onEditStep={(stepId) => {
                setErrors({});
                setCurrentStep(stepId);
              }}
              onSubmitSuccess={() => navigate('/dashboard')}
            />
          )}

          {/* Navigation Controls */}
          {currentStep < STEPS.length && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={savingDraft}
                className="rounded-lg bg-teal-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingDraft ? 'Saving...' : 'Next Step →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
