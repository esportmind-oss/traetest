const express = require('express');
const customerController = require('../controllers/customerController');
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all routes
router.use(userController.protect);

// Search routes
router.get('/search', customerController.searchCustomers);
router.get('/within/:distance/center/:latlng/unit/:unit', customerController.getCustomersWithin);

// Standard CRUD routes
router.route('/')
  .get(customerController.getAllCustomers)
  .post(customerController.createCustomer);

router.route('/:id')
  .get(customerController.getCustomer)
  .patch(customerController.updateCustomer)
  .delete(userController.restrictTo('admin', 'supervisor'), customerController.deleteCustomer);

// Get customer meter readings
router.get('/:id/meter-readings', customerController.getCustomerMeterReadings);

module.exports = router;