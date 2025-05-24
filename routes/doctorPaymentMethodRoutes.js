const express = require('express');
const router = express.Router();
const doctorPaymentMethodController = require('../controllers/doctorPaymentMethodController');

router.post('/', doctorPaymentMethodController.createDoctorPaymentMethod);
router.get('/', doctorPaymentMethodController.getAllDoctorPaymentMethods);
router.get('/:id', doctorPaymentMethodController.getDoctorPaymentMethodById);
router.delete('/:id', doctorPaymentMethodController.deleteDoctorPaymentMethod);

module.exports = router;
