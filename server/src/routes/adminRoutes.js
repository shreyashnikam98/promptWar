const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Moderator & Admin access
router.use(protect);

router.get('/reports', authorize('admin', 'moderator'), adminController.getAdminReports);
router.patch('/reports/:id/status', authorize('admin', 'moderator'), adminController.updateReportStatus);
router.patch('/reports/:id/verify', authorize('admin', 'moderator'), adminController.verifyReport);

// Strict Admin access
router.get('/users', authorize('admin'), adminController.getUsers);
router.patch('/users/:id/role', authorize('admin'), adminController.updateUserRole);
router.get('/audit-logs', authorize('admin'), adminController.getAuditLogs);

module.exports = router;
