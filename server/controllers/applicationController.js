const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');

// Required document types for a valid submission
const REQUIRED_DOCUMENTS = [
  'NIC Copy',
  'Income Certificate',
  'Electricity Bill',
  'Grama Niladhari Certificate',
];

// Data sections allowed in the application body
const DATA_SECTIONS = [
  'personalInfo',
  'householdInfo',
  'employmentInfo',
  'incomeInfo',
  'educationSkills',
  'housingInfo',
  'assetDeclaration',
  'verificationDetails',
];

// @desc    Create or update application draft (Autosave)
// @route   PUT /api/applications/draft
// @access  Private (Applicant)
const createOrUpdateDraft = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Check if an application already exists for this applicant
  let application = await Application.findOne({ applicant: userId });

  if (application && application.status !== 'Draft') {
    res.status(400);
    throw new Error(
      `Cannot update application draft. Current application status is '${application.status}'`
    );
  }

  if (!application) {
    // Create new draft application
    application = new Application({
      applicant: userId,
      status: 'Draft',
    });
  }

  // Merge provided data sections into draft
  DATA_SECTIONS.forEach((section) => {
    if (req.body[section] !== undefined) {
      const existingSection = application[section] ? application[section].toObject() : {};
      application[section] = {
        ...existingSection,
        ...req.body[section],
      };
    }
  });

  // Save without strict validation to allow partial draft saves
  await application.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Draft saved successfully',
    data: application,
  });
});

// @desc    Submit welfare application
// @route   POST /api/applications/submit
// @access  Private (Applicant)
const submitApplication = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const application = await Application.findOne({ applicant: userId });

  if (!application) {
    res.status(404);
    throw new Error('No draft application found to submit. Please save a draft first.');
  }

  if (application.status !== 'Draft') {
    res.status(400);
    throw new Error(`Application has already been submitted (Status: ${application.status})`);
  }

  const missingFields = [];

  // Check Section 1: personalInfo
  const pi = application.personalInfo || {};
  if (!pi.nicNumber) missingFields.push('personalInfo.nicNumber');
  if (!pi.fullName) missingFields.push('personalInfo.fullName');
  if (!pi.dateOfBirth) missingFields.push('personalInfo.dateOfBirth');
  if (!pi.gender) missingFields.push('personalInfo.gender');
  if (!pi.maritalStatus) missingFields.push('personalInfo.maritalStatus');
  if (!pi.mobileNumber) missingFields.push('personalInfo.mobileNumber');
  if (!pi.address) missingFields.push('personalInfo.address');
  if (!pi.district) missingFields.push('personalInfo.district');
  if (!pi.dsDivision) missingFields.push('personalInfo.dsDivision');
  if (!pi.gnDivision) missingFields.push('personalInfo.gnDivision');

  // Check Section 2: householdInfo
  const hi = application.householdInfo || {};
  if (hi.numberOfFamilyMembers === undefined || hi.numberOfFamilyMembers === null) missingFields.push('householdInfo.numberOfFamilyMembers');
  if (hi.numberOfIncomeEarners === undefined || hi.numberOfIncomeEarners === null) missingFields.push('householdInfo.numberOfIncomeEarners');
  if (hi.numberOfChildren === undefined || hi.numberOfChildren === null) missingFields.push('householdInfo.numberOfChildren');
  if (hi.numberOfElderlyDependents === undefined || hi.numberOfElderlyDependents === null) missingFields.push('householdInfo.numberOfElderlyDependents');
  if (hi.numberOfDisabledMembers === undefined || hi.numberOfDisabledMembers === null) missingFields.push('householdInfo.numberOfDisabledMembers');
  if (hi.monthlyHouseholdExpenses === undefined || hi.monthlyHouseholdExpenses === null) missingFields.push('householdInfo.monthlyHouseholdExpenses');

  // Check Section 3: employmentInfo
  const ei = application.employmentInfo || {};
  if (!ei.employmentStatus) missingFields.push('employmentInfo.employmentStatus');
  if (ei.employmentStatus && ei.employmentStatus !== 'Unemployed' && !ei.occupation) {
    missingFields.push('employmentInfo.occupation');
  }
  if (!ei.employmentType) missingFields.push('employmentInfo.employmentType');

  // Check Section 4: incomeInfo
  const ii = application.incomeInfo || {};
  if (ii.totalMonthlyHouseholdIncome === undefined || ii.totalMonthlyHouseholdIncome === null) missingFields.push('incomeInfo.totalMonthlyHouseholdIncome');

  // Check Section 5: educationSkills
  const ed = application.educationSkills || {};
  if (!ed.highestEducationalQualification) missingFields.push('educationSkills.highestEducationalQualification');

  // Check Section 6: housingInfo
  const ho = application.housingInfo || {};
  if (!ho.houseOwnership) missingFields.push('housingInfo.houseOwnership');
  if (!ho.houseType) missingFields.push('housingInfo.houseType');
  if (ho.numberOfRooms === undefined || ho.numberOfRooms === null) missingFields.push('housingInfo.numberOfRooms');
  if (!ho.roofMaterial) missingFields.push('housingInfo.roofMaterial');
  if (!ho.wallMaterial) missingFields.push('housingInfo.wallMaterial');
  if (!ho.floorMaterial) missingFields.push('housingInfo.floorMaterial');
  if (ho.accessToElectricity === undefined || ho.accessToElectricity === null) missingFields.push('housingInfo.accessToElectricity');
  if (ho.accessToCleanWater === undefined || ho.accessToCleanWater === null) missingFields.push('housingInfo.accessToCleanWater');
  if (!ho.toiletFacilities) missingFields.push('housingInfo.toiletFacilities');

  // Check Section 7: assetDeclaration
  const ad = application.assetDeclaration || {};
  if (ad.ownsVehicle === undefined || ad.ownsVehicle === null) missingFields.push('assetDeclaration.ownsVehicle');
  if (ad.ownsProperty === undefined || ad.ownsProperty === null) missingFields.push('assetDeclaration.ownsProperty');
  if (ad.ownsBusiness === undefined || ad.ownsBusiness === null) missingFields.push('assetDeclaration.ownsBusiness');
  if (ad.ownsAgriculturalLand === undefined || ad.ownsAgriculturalLand === null) missingFields.push('assetDeclaration.ownsAgriculturalLand');

  // Check Section 8: verificationDetails
  const vd = application.verificationDetails || {};
  if (!vd.bankName) missingFields.push('verificationDetails.bankName');
  if (!vd.bankAccountNumber) missingFields.push('verificationDetails.bankAccountNumber');
  if (!vd.electricityAccountNumber) missingFields.push('verificationDetails.electricityAccountNumber');

  // Check Section 9: required documents
  const uploadedDocTypes = (application.documents || []).map((doc) => doc.documentType);
  const missingDocs = REQUIRED_DOCUMENTS.filter((docType) => !uploadedDocTypes.includes(docType));

  if (missingFields.length > 0 || missingDocs.length > 0) {
    res.status(400);
    throw new Error(
      `Application submission incomplete. Missing fields/documents: ${[...missingFields, ...missingDocs].join(', ')}`
    );
  }

  // Set status and submission timestamp
  application.status = 'Submitted';
  application.submittedAt = new Date();

  // Validate entire document before finalizing submission
  await application.save();

  res.status(200).json({
    success: true,
    message: 'Application submitted successfully',
    data: application,
  });
});

// @desc    Upload documents to application
// @route   POST /api/applications/:id/documents
// @access  Private (Applicant)
const uploadDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const application = await Application.findById(id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.applicant.toString() !== userId) {
    res.status(403);
    throw new Error('Not authorized to upload documents for this application');
  }

  if (application.status !== 'Draft') {
    res.status(400);
    throw new Error('Cannot upload documents once application has been submitted');
  }

  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    res.status(400);
    throw new Error('No files provided for upload');
  }

  // Handle documentType passed as string or array in req.body
  let documentTypes = req.body.documentType || req.body.documentTypes;
  if (!Array.isArray(documentTypes)) {
    documentTypes = [documentTypes];
  }

  const newDocs = files.map((file, index) => {
    const docType = documentTypes[index] || documentTypes[0] || 'NIC Copy';
    return {
      documentType: docType,
      fileUrl: `/uploads/documents/${file.filename}`,
      fileName: file.originalname,
      uploadedAt: new Date(),
    };
  });

  application.documents.push(...newDocs);
  await application.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Documents uploaded successfully',
    data: application.documents,
  });
});

// @desc    Get current applicant's application
// @route   GET /api/applications/me
// @access  Private (Applicant)
const getMyApplication = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const application = await Application.findOne({ applicant: userId }).select(
    '+verificationDetails.bankAccountNumber'
  );

  res.status(200).json({
    success: true,
    data: application || null,
  });
});

// @desc    Delete a document from draft application
// @route   DELETE /api/applications/:id/documents/:documentId
// @access  Private (Applicant)
const deleteDocument = asyncHandler(async (req, res) => {
  const { id, documentId } = req.params;
  const userId = req.user.userId;

  const application = await Application.findById(id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.applicant.toString() !== userId) {
    res.status(403);
    throw new Error('Not authorized to modify documents for this application');
  }

  if (application.status !== 'Draft') {
    res.status(400);
    throw new Error('Cannot delete documents once application has been submitted');
  }

  const docSubDoc = application.documents.id(documentId);
  if (!docSubDoc) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Remove physical file from disk if it exists locally
  if (docSubDoc.fileUrl && docSubDoc.fileUrl.startsWith('/uploads/')) {
    const relativePath = docSubDoc.fileUrl.replace('/uploads/', '');
    const absolutePath = path.join(__dirname, '..', 'uploads', relativePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error('Failed to remove document file from disk:', err.message);
      }
    }
  }

  // Pull document subdocument
  application.documents.pull(documentId);
  await application.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully',
    data: application.documents,
  });
});

// @desc    Submit an appeal for a rejected application
// @route   POST /api/applications/appeal
// @access  Private (Applicant)
const submitAppeal = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { groundsForAppeal, appealText, contactPreference } = req.body;

  const application = await Application.findOne({ applicant: userId });

  if (!application) {
    res.status(404);
    throw new Error('Application record not found');
  }

  if (application.status !== 'Rejected') {
    res.status(400);
    throw new Error(`Cannot submit appeal. Only rejected applications can be appealed (Current status: ${application.status})`);
  }

  if (!groundsForAppeal) {
    res.status(400);
    throw new Error('Grounds for appeal is required');
  }

  if (!appealText || !appealText.trim()) {
    res.status(400);
    throw new Error('Appeal explanation text is required');
  }

  if (appealText.trim().length > 1500) {
    res.status(400);
    throw new Error('Appeal explanation text cannot exceed 1500 characters');
  }

  application.appeal = {
    groundsForAppeal,
    appealText: appealText.trim(),
    contactPreference: contactPreference || 'Email',
    documents: [],
    submittedAt: new Date(),
    reviewedBy: null,
    reviewNotes: '',
    decision: null,
    reviewedAt: null,
  };

  application.status = 'Appealed';
  await application.save();

  res.status(200).json({
    success: true,
    message: 'Appeal submitted successfully',
    data: application,
  });
});

// @desc    Upload evidence documents for an appeal
// @route   POST /api/applications/appeal/documents
// @access  Private (Applicant)
const uploadAppealDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const application = await Application.findOne({ applicant: userId });

  if (!application || application.status !== 'Appealed' || !application.appeal) {
    res.status(400);
    throw new Error('Cannot upload appeal documents. Application status must be Appealed.');
  }

  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    res.status(400);
    throw new Error('No files provided for appeal upload');
  }

  let documentTypes = req.body.documentType || req.body.documentTypes;
  if (!Array.isArray(documentTypes)) {
    documentTypes = [documentTypes];
  }

  const newDocs = files.map((file, index) => {
    const docType = documentTypes[index] || documentTypes[0] || 'Appeal Supporting Evidence';
    return {
      documentType: docType,
      fileUrl: `/uploads/documents/${file.filename}`,
      fileName: file.originalname,
      uploadedAt: new Date(),
    };
  });

  application.appeal.documents.push(...newDocs);
  await application.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Appeal documents uploaded successfully',
    data: application.appeal.documents,
  });
});

module.exports = {
  createOrUpdateDraft,
  submitApplication,
  uploadDocuments,
  getMyApplication,
  deleteDocument,
  submitAppeal,
  uploadAppealDocuments,
};
