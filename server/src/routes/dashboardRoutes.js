const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.getSummary);
router.get('/reports', dashboardController.getReportAnalytics);
router.get('/categories', dashboardController.getCategoryAnalytics);

module.exports = router;
