const express = require('express');
const router = express.Router();
const doctorScheduleController = require('../controllers/doctorScheduleController');

router.post('/', doctorScheduleController.createDoctorSchedule);
router.get('/', doctorScheduleController.getAllDoctorSchedules);
router.get('/:id', doctorScheduleController.getDoctorScheduleById);
router.put('/:id', doctorScheduleController.updateDoctorSchedule);
router.delete('/:id', doctorScheduleController.deleteDoctorSchedule);

module.exports = router;
