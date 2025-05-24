const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const upload = require('../configs/multerConfig');

router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);
router.put(
  '/:id',
  upload.single('userAvatar'),
  patientController.updatePatient
);

module.exports = router;
