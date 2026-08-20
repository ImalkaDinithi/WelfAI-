// Application Form Validation Utility

export const validatePersonalInfo = (data = {}) => {
  const errors = {};
  if (!data.nicNumber?.trim()) {
    errors.nicNumber = 'NIC number is required';
  } else if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(data.nicNumber.trim())) {
    errors.nicNumber = 'Invalid Sri Lankan NIC format (e.g., 199012345678 or 901234567V)';
  }

  if (!data.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  }

  if (!data.gender) {
    errors.gender = 'Please select a gender';
  }

  if (!data.maritalStatus) {
    errors.maritalStatus = 'Please select a marital status';
  }

  if (!data.mobileNumber?.trim()) {
    errors.mobileNumber = 'Mobile number is required';
  } else if (!/^(?:\+94|0)?[7][0-9]{8}$/.test(data.mobileNumber.trim())) {
    errors.mobileNumber = 'Invalid Sri Lankan mobile format (e.g., 0712345678)';
  }

  if (data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Invalid email address format';
  }

  if (!data.address?.trim()) {
    errors.address = 'Residential address is required';
  }

  if (!data.district) {
    errors.district = 'Please select a district';
  }

  if (!data.dsDivision) {
    errors.dsDivision = 'Please select a DS division';
  }

  if (!data.gnDivision) {
    errors.gnDivision = 'Please select a GN division';
  }

  return errors;
};

export const validateHouseholdInfo = (data = {}) => {
  const errors = {};

  if (data.numberOfFamilyMembers === undefined || data.numberOfFamilyMembers === null || data.numberOfFamilyMembers === '') {
    errors.numberOfFamilyMembers = 'Number of family members is required';
  } else if (Number(data.numberOfFamilyMembers) < 1 || !Number.isInteger(Number(data.numberOfFamilyMembers))) {
    errors.numberOfFamilyMembers = 'Must be an integer of at least 1 member';
  }

  if (data.numberOfIncomeEarners === undefined || data.numberOfIncomeEarners === null || data.numberOfIncomeEarners === '') {
    errors.numberOfIncomeEarners = 'Number of income earners is required';
  } else if (Number(data.numberOfIncomeEarners) < 0) {
    errors.numberOfIncomeEarners = 'Cannot be negative';
  }

  if (data.numberOfChildren === undefined || data.numberOfChildren === null || data.numberOfChildren === '') {
    errors.numberOfChildren = 'Number of children is required';
  } else if (Number(data.numberOfChildren) < 0) {
    errors.numberOfChildren = 'Cannot be negative';
  }

  if (data.numberOfElderlyDependents === undefined || data.numberOfElderlyDependents === null || data.numberOfElderlyDependents === '') {
    errors.numberOfElderlyDependents = 'Number of elderly dependents is required';
  } else if (Number(data.numberOfElderlyDependents) < 0) {
    errors.numberOfElderlyDependents = 'Cannot be negative';
  }

  if (data.numberOfDisabledMembers === undefined || data.numberOfDisabledMembers === null || data.numberOfDisabledMembers === '') {
    errors.numberOfDisabledMembers = 'Number of disabled members is required';
  } else if (Number(data.numberOfDisabledMembers) < 0) {
    errors.numberOfDisabledMembers = 'Cannot be negative';
  }

  if (data.monthlyHouseholdExpenses === undefined || data.monthlyHouseholdExpenses === null || data.monthlyHouseholdExpenses === '') {
    errors.monthlyHouseholdExpenses = 'Monthly household expenses are required';
  } else if (Number(data.monthlyHouseholdExpenses) < 0) {
    errors.monthlyHouseholdExpenses = 'Expenses cannot be negative';
  }

  return errors;
};

export const validateEmploymentInfo = (data = {}) => {
  const errors = {};

  if (!data.employmentStatus) {
    errors.employmentStatus = 'Please select employment status';
  }

  if (!data.employmentType) {
    errors.employmentType = 'Please select employment type';
  }

  if (data.employmentStatus && data.employmentStatus !== 'Unemployed' && !data.occupation?.trim()) {
    errors.occupation = 'Occupation is required for employed status';
  }

  if (data.yearsOfEmployment !== undefined && data.yearsOfEmployment !== null && data.yearsOfEmployment !== '') {
    if (Number(data.yearsOfEmployment) < 0) {
      errors.yearsOfEmployment = 'Years of employment cannot be negative';
    }
  }

  return errors;
};

export const validateIncomeInfo = (data = {}) => {
  const errors = {};

  if (data.totalMonthlyHouseholdIncome === undefined || data.totalMonthlyHouseholdIncome === null || data.totalMonthlyHouseholdIncome === '') {
    errors.totalMonthlyHouseholdIncome = 'Total monthly household income is required';
  } else if (Number(data.totalMonthlyHouseholdIncome) < 0) {
    errors.totalMonthlyHouseholdIncome = 'Total monthly income cannot be negative';
  }

  ['salaryIncome', 'businessIncome', 'agriculturalIncome', 'pensionIncome', 'otherIncome'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      if (Number(data[field]) < 0) {
        errors[field] = 'Income value cannot be negative';
      }
    }
  });

  return errors;
};

export const validateEducationSkills = (data = {}) => {
  const errors = {};

  if (!data.highestEducationalQualification) {
    errors.highestEducationalQualification = 'Please select highest educational qualification';
  }

  return errors;
};

export const validateHousingInfo = (data = {}) => {
  const errors = {};

  if (!data.houseOwnership) {
    errors.houseOwnership = 'Please select house ownership status';
  }

  if (!data.houseType?.trim()) {
    errors.houseType = 'House type is required';
  }

  if (data.numberOfRooms === undefined || data.numberOfRooms === null || data.numberOfRooms === '') {
    errors.numberOfRooms = 'Number of rooms is required';
  } else if (Number(data.numberOfRooms) < 1 || !Number.isInteger(Number(data.numberOfRooms))) {
    errors.numberOfRooms = 'Must be an integer of at least 1 room';
  }

  if (!data.roofMaterial?.trim()) {
    errors.roofMaterial = 'Roof material is required';
  }

  if (!data.wallMaterial?.trim()) {
    errors.wallMaterial = 'Wall material is required';
  }

  if (!data.floorMaterial?.trim()) {
    errors.floorMaterial = 'Floor material is required';
  }

  if (data.accessToElectricity === undefined || data.accessToElectricity === null) {
    errors.accessToElectricity = 'Please specify electricity grid access';
  }

  if (data.accessToCleanWater === undefined || data.accessToCleanWater === null) {
    errors.accessToCleanWater = 'Please specify clean water access';
  }

  if (!data.toiletFacilities?.trim()) {
    errors.toiletFacilities = 'Toilet facilities description is required';
  }

  return errors;
};

export const validateAssetDeclaration = (data = {}) => {
  const errors = {};

  if (data.ownsVehicle === undefined || data.ownsVehicle === null) {
    errors.ownsVehicle = 'Please specify motor vehicle ownership';
  } else if (data.ownsVehicle && (data.numberOfVehicles === undefined || Number(data.numberOfVehicles) < 1)) {
    errors.numberOfVehicles = 'Please enter number of vehicles owned';
  }

  if (data.ownsProperty === undefined || data.ownsProperty === null) {
    errors.ownsProperty = 'Please specify land/property ownership';
  } else if (data.ownsProperty && (data.numberOfProperties === undefined || Number(data.numberOfProperties) < 1)) {
    errors.numberOfProperties = 'Please enter number of properties owned';
  }

  if (data.ownsBusiness === undefined || data.ownsBusiness === null) {
    errors.ownsBusiness = 'Please specify business ownership';
  }

  if (data.ownsAgriculturalLand === undefined || data.ownsAgriculturalLand === null) {
    errors.ownsAgriculturalLand = 'Please specify agricultural land ownership';
  }

  return errors;
};

export const validateVerificationDetails = (data = {}) => {
  const errors = {};

  if (!data.bankName?.trim()) {
    errors.bankName = 'Bank name is required';
  }

  if (!data.bankAccountNumber?.trim()) {
    errors.bankAccountNumber = 'Bank account number is required';
  }

  if (!data.electricityAccountNumber?.trim()) {
    errors.electricityAccountNumber = 'Electricity account number is required';
  }

  return errors;
};

export const validateStep = (stepId, formData = {}) => {
  switch (stepId) {
    case 1:
      return validatePersonalInfo(formData.personalInfo);
    case 2:
      return validateHouseholdInfo(formData.householdInfo);
    case 3:
      return validateEmploymentInfo(formData.employmentInfo);
    case 4:
      return validateIncomeInfo(formData.incomeInfo);
    case 5:
      return validateEducationSkills(formData.educationSkills);
    case 6:
      return validateHousingInfo(formData.housingInfo);
    case 7:
      return validateAssetDeclaration(formData.assetDeclaration);
    case 8:
      return validateVerificationDetails(formData.verificationDetails);
    default:
      return {};
  }
};
