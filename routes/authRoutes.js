const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/sign-up', authController.signup);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/block/:id', authController.blockAccount);

module.exports = router;
