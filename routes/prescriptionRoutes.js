const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const upload = require('../configs/multerConfig');

router.post(
  '/',
  upload.single('prescriptionImage'),
  prescriptionController.createPrescription
);
router.get('/', prescriptionController.getAllPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);
router.put(
  '/:id',
  upload.single('prescriptionImage'),
  prescriptionController.updatePrescription
);
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;
