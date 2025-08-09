const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.use(userController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updatePassword', userController.updatePassword);

// Admin only routes
router.use(userController.restrictTo('admin'));

router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;