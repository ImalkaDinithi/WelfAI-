const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Application = require('../models/Application');
const User = require('../models/User');
const { ML_SERVICE_URL } = require('../config/mlService');
const {
  buildMlFeaturePayload,
  validateMlFeaturePayload,
} = require('../utils/buildMlFeaturePayload');


// @desc    Get applications for admin review queue (supports filtering by status & district)
// @route   GET /api/admin/applications
// @access  Private/Admin
const getPendingApplications = asyncHandler(async (req, res) => {
  const { status, district } = req.query;

  const query = {};

  if (status && status !== 'ALL') {
    query.status = status;
  } else {
    query.status = { $ne: 'Draft' };
  }

  if (district && district !== 'All Districts') {
    query['personalInfo.district'] = district;
  }

  const applications = await Application.find(query)
    .populate('applicant', 'fullName email nic phone district')
    .sort({ submittedAt: -1, createdAt: -1 });

  res.json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc    Get detailed application by ID for admin review
// @route   GET /api/admin/applications/:id
// @access  Private/Admin
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('applicant', 'fullName email nic phone district')
    .populate('reviewedBy', 'fullName email')
    .populate('appeal.reviewedBy', 'fullName email');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  res.json({
    success: true,
    data: application,
  });
});

// @desc    Mark an application status as 'Under Review' when opened by an admin
// @route   PATCH /api/admin/applications/:id/review-start
// @access  Private/Admin
const markUnderReview = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.status === 'Submitted') {
    application.status = 'Under Review';
    await application.save();
  }

  res.json({
    success: true,
    message: 'Application status marked as Under Review',
    data: application,
  });
});

// @desc    Submit admin review decision (Approved or Rejected)
// @route   PATCH /api/admin/applications/:id/review
// @access  Private/Admin
const reviewApplication = asyncHandler(async (req, res) => {
  const { decision, reviewNotes } = req.body;

  if (!['Approved', 'Rejected'].includes(decision)) {
    res.status(400);
    throw new Error('Invalid review decision. Must be Approved or Rejected');
  }

  if (decision === 'Rejected' && (!reviewNotes || !reviewNotes.trim())) {
    res.status(400);
    throw new Error('Review notes are required when rejecting an application');
  }

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (!['Submitted', 'Under Review'].includes(application.status)) {
    res.status(400);
    throw new Error('Application cannot be reviewed because it is already decided or in draft status');
  }

  application.status = decision;
  application.reviewedBy = req.user.userId;
  application.reviewNotes = reviewNotes ? reviewNotes.trim() : '';
  application.reviewedAt = new Date();

  await application.save();

  res.json({
    success: true,
    message: `Application ${decision.toLowerCase()} successfully`,
    data: application,
  });
});

// @desc    Get all appealed applications for admin review (supports filtering by active, approved, rejected, all)
// @route   GET /api/admin/appeals
// @access  Private/Admin
const getAppealedApplications = asyncHandler(async (req, res) => {
  const filter = req.query.filter || 'active';
  let query = {};

  if (filter === 'approved') {
    query = { 'appeal.decision': 'Approved' };
  } else if (filter === 'rejected') {
    query = { 'appeal.decision': 'Rejected' };
  } else if (filter === 'all') {
    query = { 'appeal.submittedAt': { $exists: true } };
  } else {
    // default to 'active'
    query = { status: 'Appealed' };
  }

  const applications = await Application.find(query)
    .populate('applicant', 'fullName email nic phone district')
    .sort({ 'appeal.submittedAt': 1, submittedAt: 1 });

  res.json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc    Get all applications (excluding Draft) for admin overview with status & district filters
// @route   GET /api/admin/applications/all
// @access  Private/Admin
const getAllApplications = asyncHandler(async (req, res) => {
  const { status, district } = req.query;

  const query = { status: { $ne: 'Draft' } };

  if (status && status !== 'ALL' && status !== 'All') {
    query.status = status;
  }

  if (district && district !== 'All Districts' && district !== 'All') {
    query['personalInfo.district'] = district;
  }

  const applications = await Application.find(query)
    .populate('applicant', 'fullName email nic phone district')
    .sort({ updatedAt: -1, createdAt: -1 });

  const formattedApplications = applications.map((app) => {
    const appObj = app.toObject();
    return {
      ...appObj,
      hasAppeal: Boolean(app.appeal && app.appeal.submittedAt),
      appealOutcome: app.appeal?.decision || null,
    };
  });

  res.json({
    success: true,
    count: formattedApplications.length,
    data: formattedApplications,
  });
});

// @desc    Submit admin determination for an appeal
// @route   PATCH /api/admin/appeals/:id/review
// @access  Private/Admin
const reviewAppeal = asyncHandler(async (req, res) => {
  const { decision, reviewNotes } = req.body;

  if (!['Approved', 'Rejected'].includes(decision)) {
    res.status(400);
    throw new Error('Invalid appeal decision. Must be Approved or Rejected');
  }

  if (!reviewNotes || !reviewNotes.trim()) {
    res.status(400);
    throw new Error('Review notes explanation is required for appeal determinations');
  }

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (application.status !== 'Appealed' || !application.appeal) {
    res.status(400);
    throw new Error('Cannot review appeal. Application status is not Appealed.');
  }

  application.appeal.decision = decision;
  application.appeal.reviewedBy = req.user.userId;
  application.appeal.reviewNotes = reviewNotes.trim();
  application.appeal.reviewedAt = new Date();

  // Set top-level status to the appeal outcome
  application.status = decision;

  await application.save();

  res.json({
    success: true,
    message: `Appeal ${decision.toLowerCase()} successfully`,
    data: application,
  });
});

// ---------------------------------------------------------------------------
// Lifestyle Improvement Plan — Admin Handlers
// ---------------------------------------------------------------------------

// @desc    Get lifestyle plans — filterable by status
// @route   GET /api/admin/lifestyle-plans?filter=active|assessed|all
// @access  Private/Admin
const getPlansForReview = asyncHandler(async (req, res) => {
  const filter = req.query.filter || 'active';

  let statusFilter;
  if (filter === 'assessed') {
    statusFilter = { $in: ['ML Assessed'] };
  } else if (filter === 'all') {
    statusFilter = { $in: ['Submitted', 'Under Review', 'ML Assessed'] };
  } else {
    // default: 'active' — pending review
    statusFilter = { $in: ['Submitted', 'Under Review'] };
  }

  const applications = await Application.find({
    'lifestylePlan.status': statusFilter,
  })
    .populate('applicant', 'fullName email')
    .sort({ 'lifestylePlan.submittedAt': 1 }); // FIFO — oldest first

  res.json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// @desc    Mark a lifestyle plan as 'Under Review' on first admin open
// @route   PATCH /api/admin/lifestyle-plans/:id/review-start
// @access  Private/Admin
const markPlanUnderReview = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (!application.lifestylePlan) {
    res.status(400);
    throw new Error('This application does not have a lifestyle plan');
  }

  // No-op if already progressed past 'Submitted'
  if (application.lifestylePlan.status === 'Submitted') {
    application.lifestylePlan.status = 'Under Review';
    await application.save();
  }

  res.json({
    success: true,
    message: 'Lifestyle plan status marked as Under Review',
    data: application,
  });
});

// ---------------------------------------------------------------------------
// ML Prediction Service — Real FastAPI HTTP Integration
// Service URL is configurable via ML_SERVICE_URL environment variable.
// ---------------------------------------------------------------------------

// @desc    Check ML prediction service health
// @route   GET /api/admin/ml-service-health
// @access  Private/Admin
const getMlServiceHealth = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3000 });
    res.json({
      success: true,
      status: 'online',
      data: response.data,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'offline',
      message: `ML Service unreachable at ${ML_SERVICE_URL}: ${error.message}`,
    });
  }
});

// @desc    Run ML prediction on a lifestyle plan via FastAPI ML Service
// @route   POST /api/admin/lifestyle-plans/:id/predict
// @access  Private/Admin
const runMlPrediction = asyncHandler(async (req, res) => {
  const { adminReviewNotes } = req.body;

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  if (!application.lifestylePlan) {
    res.status(400);
    throw new Error('This application does not have a lifestyle plan');
  }

  if (!['Submitted', 'Under Review'].includes(application.lifestylePlan.status)) {
    res.status(400);
    throw new Error(
      `ML prediction can only be run on plans with status 'Submitted' or 'Under Review' (current: ${application.lifestylePlan.status})`
    );
  }

  // Build feature payload from application and validate it
  let featurePayload;
  try {
    featurePayload = buildMlFeaturePayload(application);
    validateMlFeaturePayload(featurePayload);
  } catch (validationErr) {
    res.status(503);
    return res.json({
      success: false,
      message: `ML prediction failed payload validation: ${validationErr.message}`,
    });
  }

  // Call FastAPI ML service /predict endpoint (URL configurable via ML_SERVICE_URL)
  let predictionResponse;
  try {
    predictionResponse = await axios.post(`${ML_SERVICE_URL}/predict`, featurePayload, {
      timeout: 5000,
    });
  } catch (apiErr) {
    const errorDetails = apiErr.response?.data?.detail
      ? (typeof apiErr.response.data.detail === 'string'
          ? apiErr.response.data.detail
          : JSON.stringify(apiErr.response.data.detail))
      : apiErr.message;

    res.status(503);
    return res.json({
      success: false,
      message: `ML prediction service call failed: ${errorDetails}`,
    });
  }

  const { successProbability, estimatedDurationMonths, modelVersion } = predictionResponse.data;

  // Store result
  application.lifestylePlan.mlPrediction = {
    successProbability,
    estimatedDurationMonths,
    modelVersion,
    predictedAt: new Date(),
  };

  application.lifestylePlan.status = 'ML Assessed';

  // Optionally capture admin review context submitted alongside prediction
  if (adminReviewNotes && adminReviewNotes.trim()) {
    application.lifestylePlan.adminReviewNotes = adminReviewNotes.trim();
    application.lifestylePlan.reviewedBy = req.user.userId;
    application.lifestylePlan.reviewedAt = new Date();
  }

  await application.save();

  res.json({
    success: true,
    message: 'ML prediction completed successfully',
    data: application,
  });
});

// @desc    Get detailed progress timeline for an assessed lifestyle plan
// @route   GET /api/admin/lifestyle-plans/:id/progress
// @access  Private/Admin
const getPlanProgress = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const lp = application.lifestylePlan;
  if (!lp) {
    res.status(400);
    throw new Error('Lifestyle plan not found on this application');
  }

  const estimatedDuration = lp.mlPrediction?.estimatedDurationMonths || 0;
  const docs = lp.supportingDocuments || [];
  const reviews = lp.periodReviews || [];

  const periods = [];
  for (let i = 1; i <= estimatedDuration; i++) {
    const label = `Month ${i}`;
    const periodDocs = docs.filter((d) => d.periodLabel === label);
    const review = reviews.find((r) => r.periodLabel === label);

    periods.push({
      periodLabel: label,
      documents: periodDocs,
      reviewStatus: review ? review.status : 'Pending',
      reviewNotes: review ? review.reviewNotes : '',
      reviewedAt: review ? review.reviewedAt : null,
      reviewedBy: review ? review.reviewedBy : null,
    });
  }

  const lpObj = lp.toObject();
  lpObj.periods = periods;

  res.json({
    success: true,
    data: lpObj,
  });
});

// @desc    Admin review and submit decision/notes for a specific program period
// @route   PATCH /api/admin/lifestyle-plans/:id/progress/review
// @access  Private/Admin
const reviewPlanPeriod = asyncHandler(async (req, res) => {
  const { periodLabel, reviewNotes } = req.body;

  if (!periodLabel) {
    res.status(400);
    throw new Error('Period label is required');
  }

  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const lp = application.lifestylePlan;
  if (!lp) {
    res.status(400);
    throw new Error('Lifestyle plan not found');
  }

  if (lp.status !== 'ML Assessed') {
    res.status(400);
    throw new Error('ML prediction must be run and assessed first');
  }

  const estimatedDuration = lp.mlPrediction?.estimatedDurationMonths || 0;
  const match = /^Month (\d+)$/.exec(periodLabel);
  if (!match) {
    res.status(400);
    throw new Error('Invalid period label format. Must be "Month X"');
  }

  const periodNum = parseInt(match[1], 10);
  if (periodNum < 1 || periodNum > estimatedDuration) {
    res.status(400);
    throw new Error(`Period label must be between Month 1 and Month ${estimatedDuration}`);
  }

  if (!lp.periodReviews) {
    lp.periodReviews = [];
  }

  let existingReview = lp.periodReviews.find((r) => r.periodLabel === periodLabel);

  if (existingReview) {
    existingReview.status = 'Reviewed';
    existingReview.reviewNotes = reviewNotes !== undefined ? reviewNotes.trim() : existingReview.reviewNotes;
    existingReview.reviewedBy = req.user.userId;
    existingReview.reviewedAt = new Date();
  } else {
    lp.periodReviews.push({
      periodLabel,
      status: 'Reviewed',
      reviewNotes: reviewNotes !== undefined ? reviewNotes.trim() : '',
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
    });
  }

  await application.save();

  res.status(200).json({
    success: true,
    message: `Period ${periodLabel} reviewed successfully`,
    data: lp,
  });
});

// ---------------------------------------------------------------------------

module.exports = {
  getPendingApplications,
  getApplicationById,
  markUnderReview,
  reviewApplication,
  getAppealedApplications,
  getAllApplications,
  reviewAppeal,
  getPlansForReview,
  markPlanUnderReview,
  runMlPrediction,
  getMlServiceHealth,
  getPlanProgress,
  reviewPlanPeriod,
};
