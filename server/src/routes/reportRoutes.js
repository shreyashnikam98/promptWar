const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'voiceNote', maxCount: 1 }
]);

router.get('/', reportController.getReports);
router.get('/mine', protect, reportController.getMyReports);
router.get('/:id', reportController.getReportById);
router.post('/', optionalAuth, uploadFields, reportController.createReport);
router.patch('/:id', protect, reportController.updateReport);
router.post('/:id/feedback', optionalAuth, reportController.submitReportFeedback);
router.delete('/:id', protect, reportController.deleteReport);

module.exports = router;
