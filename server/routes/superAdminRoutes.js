const express = require('express');
const router = express.Router();
const {
  getDivisionsData,
  getDashboardSummary,
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All superadmin routes require authentication and superadmin authorization
router.use(protect, authorize('superadmin'));

router.get('/divisions', getDivisionsData);
router.get('/dashboard-summary', getDashboardSummary);

module.exports = router;
