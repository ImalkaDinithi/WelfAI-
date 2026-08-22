const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const User = require('../models/User');

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

module.exports = {
  getPendingApplications,
  getApplicationById,
  markUnderReview,
  reviewApplication,
  getAppealedApplications,
  getAllApplications,
  reviewAppeal,
};
