const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPendingApplications,
  getAllApplications,
  getApplicationById,
  markUnderReview,
  reviewApplication,
  getAppealedApplications,
  reviewAppeal,
} = require('../controllers/adminController');

// All admin routes require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/applications
router.get('/applications', getPendingApplications);

// @route   GET /api/admin/applications/all
router.get('/applications/all', getAllApplications);

// @route   GET /api/admin/applications/:id
router.get('/applications/:id', getApplicationById);

// @route   PATCH /api/admin/applications/:id/review-start
router.patch('/applications/:id/review-start', markUnderReview);

// @route   PATCH /api/admin/applications/:id/review
router.patch('/applications/:id/review', reviewApplication);

// @route   GET /api/admin/appeals
router.get('/appeals', getAppealedApplications);

// @route   PATCH /api/admin/appeals/:id/review
router.patch('/appeals/:id/review', reviewAppeal);

module.exports = router;
