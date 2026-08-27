const ALLOWED_EMPLOYMENT_TYPES = [
  'Unemployed',
  'Daily-Wage',
  'Self-Employed',
  'Permanent',
];

const ALLOWED_EDUCATION_QUALIFICATIONS = [
  'No Schooling',
  'Primary',
  'O-Level',
  'A-Level',
  'Vocational',
  'Degree',
];

/**
 * Maps Application document fields to ML FastAPI prediction service request body shape.
 *
 * @param {Object} application Mongo application document
 * @returns {Object} ML feature payload
 */
const buildMlFeaturePayload = (application) => {
  const ownsVehicle = Boolean(application?.assetDeclaration?.ownsVehicle);
  const ownsBusiness = Boolean(application?.assetDeclaration?.ownsBusiness);
  const ownsAgriculturalLand = Boolean(application?.assetDeclaration?.ownsAgriculturalLand);

  const assetScore = (ownsVehicle ? 1 : 0) + (ownsBusiness ? 1 : 0) + (ownsAgriculturalLand ? 1 : 0);

  const focusAreasList = Array.isArray(application?.lifestylePlan?.focusAreas)
    ? application.lifestylePlan.focusAreas
    : [];

  return {
    district: application?.personalInfo?.district,
    householdSize: Number(application?.householdInfo?.numberOfFamilyMembers ?? 0),
    numberOfIncomeEarners: Number(application?.householdInfo?.numberOfIncomeEarners ?? 0),
    numberOfChildren: Number(application?.householdInfo?.numberOfChildren ?? 0),
    numberOfElderlyDependents: Number(application?.householdInfo?.numberOfElderlyDependents ?? 0),
    numberOfDisabledMembers: Number(application?.householdInfo?.numberOfDisabledMembers ?? 0),
    employmentType: application?.employmentInfo?.employmentType,
    yearsOfEmployment: Number(application?.employmentInfo?.yearsOfEmployment ?? 0),
    highestEducationalQualification: application?.educationSkills?.highestEducationalQualification,
    totalMonthlyHouseholdIncome: Number(application?.incomeInfo?.totalMonthlyHouseholdIncome ?? 0),
    monthlyHouseholdExpenses: Number(application?.householdInfo?.monthlyHouseholdExpenses ?? 0),
    houseOwnership: application?.housingInfo?.houseOwnership,
    accessToElectricity: Boolean(application?.housingInfo?.accessToElectricity),
    accessToCleanWater: Boolean(application?.housingInfo?.accessToCleanWater),
    assetScore,
    numFocusAreas: focusAreasList.length,
    focusAreas: focusAreasList.join(';'),
    requestedDurationMonths: Number(application?.lifestylePlan?.requestedDurationMonths ?? 0),
  };
};

/**
 * Validates payload fields to ensure ML service does not reject with 422
 *
 * @param {Object} payload Feature payload
 */
const validateMlFeaturePayload = (payload) => {
  if (!ALLOWED_EMPLOYMENT_TYPES.includes(payload.employmentType)) {
    throw new Error(
      `Invalid employmentType '${payload.employmentType}'. Must be one of: ${ALLOWED_EMPLOYMENT_TYPES.join(', ')}`
    );
  }

  if (!ALLOWED_EDUCATION_QUALIFICATIONS.includes(payload.highestEducationalQualification)) {
    throw new Error(
      `Invalid highestEducationalQualification '${payload.highestEducationalQualification}'. Must be one of: ${ALLOWED_EDUCATION_QUALIFICATIONS.join(', ')}`
    );
  }
};

module.exports = {
  buildMlFeaturePayload,
  validateMlFeaturePayload,
  ALLOWED_EMPLOYMENT_TYPES,
  ALLOWED_EDUCATION_QUALIFICATIONS,
};
