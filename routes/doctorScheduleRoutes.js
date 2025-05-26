const express = require('express');
const router = express.Router();
const doctorScheduleController = require('../controllers/doctorScheduleController');

router.post('/', doctorScheduleController.createDoctorSchedule);
router.get('/', doctorScheduleController.getAllDoctorSchedules);
router.get('/:id', doctorScheduleController.getDoctorScheduleById);
router.put('/:id', doctorScheduleController.updateDoctorSchedule);
router.delete('/:id', doctorScheduleController.deleteDoctorSchedule);
router.get(
  '/doctor/:doctorId',
  doctorScheduleController.getSchedulesByDoctorId
);
router.delete(
  '/doctor/:doctorId/schedule/:scheduleId',
  doctorScheduleController.deleteDoctorSchedule
);

module.exports = router;
