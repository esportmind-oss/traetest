const express = require('express');
const meterController = require('../controllers/meterController');
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all routes
router.use(userController.protect);

// Get meter readings by period
router.get('/period/:month/:year', meterController.getMeterReadingsByPeriod);

// Get meter readings by reader
router.get('/reader/:id', meterController.getMeterReadingsByReader);

// Get meter reading statistics
router.get('/stats', userController.restrictTo('admin', 'supervisor'), meterController.getMeterReadingStats);

// Verify meter reading (supervisor only)
router.patch('/:id/verify', userController.restrictTo('admin', 'supervisor'), meterController.verifyMeterReading);

// Standard CRUD routes
router.route('/')
  .get(meterController.getAllMeterReadings)
  .post(meterController.createMeterReading);

router.route('/:id')
  .get(meterController.getMeterReading)
  .patch(meterController.updateMeterReading)
  .delete(userController.restrictTo('admin', 'supervisor'), meterController.deleteMeterReading);

module.exports = router;