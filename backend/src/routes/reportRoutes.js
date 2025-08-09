const express = require('express');
const reportController = require('../controllers/reportController');
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all routes
router.use(userController.protect);

// Monthly consumption report
router.get('/monthly/:month/:year', reportController.getMonthlyConsumptionReport);

// Yearly consumption report
router.get('/yearly/:year', reportController.getYearlyConsumptionReport);

// Customer consumption history
router.get('/customer/:customerId', reportController.getCustomerConsumptionHistory);

// Meter reader performance report (admin and supervisor only)
router.get(
  '/reader-performance/:month/:year',
  userController.restrictTo('admin', 'supervisor'),
  reportController.getMeterReaderPerformance
);

// Anomaly detection report (admin and supervisor only)
router.get(
  '/anomalies/:month/:year/:threshold?',
  userController.restrictTo('admin', 'supervisor'),
  reportController.getAnomalyReport
);

module.exports = router;