const express = require('express');
const router = express.Router();
const statisticController = require('../controllers/statisticController');

router.get('/revenue', statisticController.getRevenueStatistics);
router.get('/doctor-revenue', statisticController.getDoctorRevenueStatistics);
router.get(
  '/total-complete-bookings',
  statisticController.getTotalCompleteBookings
);
router.get('/total-doctors', statisticController.getAllDoctors);
router.get('/top-vip-patients', statisticController.getTopVipPatients);

module.exports = router;
