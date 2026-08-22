const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createOrUpdateDraft,
  submitApplication,
  uploadDocuments,
  getMyApplication,
  deleteDocument,
  submitAppeal,
  uploadAppealDocuments,
} = require('../controllers/applicationController');

// @route   PUT /api/applications/draft
router.put('/draft', protect, createOrUpdateDraft);

// @route   POST /api/applications/submit
router.post('/submit', protect, submitApplication);

// @route   POST /api/applications/appeal
router.post('/appeal', protect, submitAppeal);

// @route   POST /api/applications/appeal/documents
router.post('/appeal/documents', protect, upload.array('files', 5), uploadAppealDocuments);

// @route   POST /api/applications/:id/documents
router.post('/:id/documents', protect, upload.array('files', 10), uploadDocuments);

// @route   GET /api/applications/me
router.get('/me', protect, getMyApplication);

// @route   DELETE /api/applications/:id/documents/:documentId
router.delete('/:id/documents/:documentId', protect, deleteDocument);

module.exports = router;
