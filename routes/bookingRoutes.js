const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);
router.patch('/:id/cancel', bookingController.cancelBooking);
router.get(
  '/patient/:patientId/histories',
  bookingController.getPatientBookingHistories
);
router.get('/doctor/:doctorId', bookingController.getDoctorBookings);

module.exports = router;
