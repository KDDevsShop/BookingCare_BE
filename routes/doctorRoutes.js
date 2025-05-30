const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const upload = require('../configs/multerConfig');

router.post('/', upload.single('userAvatar'), doctorController.createDoctor);
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/specialty/:specialtyId', doctorController.getDoctorsBySpecialty);
router.put('/:id', upload.single('userAvatar'), doctorController.updateDoctor);
router.delete('/:id', doctorController.deleteDoctor);

module.exports = router;
