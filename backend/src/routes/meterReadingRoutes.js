const express = require('express');
const router = express.Router();
const meterReadingController = require('../controllers/meterReadingController');

router.post('/readings', meterReadingController.createReading);
router.get('/readings', meterReadingController.getAllReadings);
router.get('/readings/:id', meterReadingController.getReadingById);
router.patch('/readings/:id/status', meterReadingController.updateReadingStatus);

module.exports = router;