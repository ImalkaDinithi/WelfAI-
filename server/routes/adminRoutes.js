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
  getPlansForReview,
  markPlanUnderReview,
  runMlPrediction,
  getMlServiceHealth,
  getPlanProgress,
  reviewPlanPeriod,
} = require('../controllers/adminController');

// All admin routes require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

// ML Service Health Check route
// @route   GET /api/admin/ml-service-health
router.get('/ml-service-health', getMlServiceHealth);

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

// Lifestyle Improvement Plan routes
// @route   GET /api/admin/lifestyle-plans
router.get('/lifestyle-plans', getPlansForReview);

// @route   PATCH /api/admin/lifestyle-plans/:id/review-start
router.patch('/lifestyle-plans/:id/review-start', markPlanUnderReview);

// @route   POST /api/admin/lifestyle-plans/:id/predict
router.post('/lifestyle-plans/:id/predict', runMlPrediction);

// @route   GET /api/admin/lifestyle-plans/:id/progress
router.get('/lifestyle-plans/:id/progress', getPlanProgress);

// @route   PATCH /api/admin/lifestyle-plans/:id/progress/review
router.patch('/lifestyle-plans/:id/progress/review', reviewPlanPeriod);

module.exports = router;
