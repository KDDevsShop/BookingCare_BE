const { Booking, Doctor } = require('../models');
const { Op } = require('sequelize');

// GET /api/statistics/revenue?year=YYYY&month=MM
const getRevenueStatistics = async (req, res) => {
  try {
    let { year, month } = req.query;
    const now = new Date();
    if (!year && !month) {
      year = now.getFullYear();
    }
    let where = { bookingStatus: 'Đã hoàn thành' };
    let group = [];
    let attributes = [];
    let result = [];

    if (year && !month) {
      // Revenue by month in a year
      where.bookingDate = {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      };
      attributes = [
        [
          Booking.sequelize.fn('MONTH', Booking.sequelize.col('bookingDate')),
          'month',
        ],
        [
          Booking.sequelize.fn('SUM', Booking.sequelize.col('bookingPrice')),
          'revenue',
        ],
      ];
      group = ['month'];
      const stats = await Booking.findAll({
        where,
        attributes,
        group,
        order: group,
        raw: true,
      });
      // Fill all months
      for (let m = 1; m <= 12; m++) {
        const found = stats.find((s) => parseInt(s.month) === m);
        result.push({ month: m, revenue: found ? Number(found.revenue) : 0 });
      }
    } else if (month) {
      // Revenue by day in a month (default to current year if year not provided)
      if (!year) year = now.getFullYear();
      const start = `${year}-${month.padStart(2, '0')}-01`;
      const end = new Date(year, parseInt(month), 0).toISOString().slice(0, 10);
      where.bookingDate = {
        [Op.between]: [start, end],
      };
      attributes = [
        [
          Booking.sequelize.fn('DAY', Booking.sequelize.col('bookingDate')),
          'day',
        ],
        [
          Booking.sequelize.fn('SUM', Booking.sequelize.col('bookingPrice')),
          'revenue',
        ],
      ];
      group = ['day'];
      const stats = await Booking.findAll({
        where,
        attributes,
        group,
        order: group,
        raw: true,
      });
      // Fill all days in month
      const daysInMonth = new Date(year, parseInt(month), 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const found = stats.find((s) => parseInt(s.day) === d);
        result.push({ day: d, revenue: found ? Number(found.revenue) : 0 });
      }
    }
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get revenue statistics failed', error: error.message });
  }
};

// GET /api/statistics/doctor-revenue?year=YYYY&month=MM&top3=true
const getDoctorRevenueStatistics = async (req, res) => {
  try {
    let { year, month, top3 = 'false' } = req.query;
    const now = new Date();
    if (!year && !month) {
      year = now.getFullYear();
    }
    const { Doctor } = require('../models');
    let where = { bookingStatus: 'Đã hoàn thành' };
    if (year && !month) {
      where.bookingDate = {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      };
    } else if (month) {
      if (!year) year = now.getFullYear();
      const start = `${year}-${month.padStart(2, '0')}-01`;
      const end = new Date(year, parseInt(month), 0).toISOString().slice(0, 10);
      where.bookingDate = {
        [Op.between]: [start, end],
      };
    }
    // Get all doctors
    const doctors = await Doctor.findAll({
      attributes: ['id', 'doctorName'],
      raw: true,
    });
    // Get revenue and total complete bookings for each doctor
    const doctorStats = await Booking.findAll({
      where,
      attributes: [
        'doctorId',
        [
          Booking.sequelize.fn('SUM', Booking.sequelize.col('bookingPrice')),
          'revenue',
        ],
        [
          Booking.sequelize.fn('COUNT', Booking.sequelize.col('id')),
          'totalCompleteBookings',
        ],
      ],
      group: ['doctorId'],
      raw: true,
    });
    // Merge all doctors with stats, fill 0 if not found
    const result = doctors.map((doc) => {
      const stat = doctorStats.find((s) => s.doctorId === doc.id);
      return {
        doctorId: doc.id,
        doctorName: doc.doctorName,
        revenue: stat ? Number(stat.revenue) : 0,
        totalCompleteBookings: stat ? Number(stat.totalCompleteBookings) : 0,
      };
    });
    // Sort by revenue desc
    result.sort((a, b) => b.revenue - a.revenue);
    // Top 3 if requested
    if (top3 === 'true') {
      return res.status(200).json(result.slice(0, 3));
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Get doctor revenue statistics failed',
      error: error.message,
    });
  }
};

// GET /api/statistics/total-complete-bookings?year=YYYY&month=MM
const getTotalCompleteBookings = async (req, res) => {
  try {
    let { year, month } = req.query;
    const now = new Date();
    if (!year && !month) {
      year = now.getFullYear();
    }
    let where = { bookingStatus: 'Đã hoàn thành' };
    if (year && !month) {
      where.bookingDate = {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      };
    } else if (month) {
      if (!year) year = now.getFullYear();
      const start = `${year}-${month.padStart(2, '0')}-01`;
      const end = new Date(year, parseInt(month), 0).toISOString().slice(0, 10);
      where.bookingDate = {
        [Op.between]: [start, end],
      };
    }
    const total = await Booking.count({ where });
    return res.status(200).json({ total });
  } catch (error) {
    return res.status(500).json({
      message: 'Get total complete bookings failed',
      error: error.message,
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: ['id', 'doctorName'],
      raw: true,
    });
    return res.status(200).json({ total: doctors.length, doctors });
  } catch (error) {
    return res.status(500).json({
      message: 'Get all doctors failed',
      error: error.message,
    });
  }
};

// GET /api/statistics/top-vip-patients?year=YYYY&month=MM
const getTopVipPatients = async (req, res) => {
  try {
    let { year, month } = req.query;
    const now = new Date();
    if (!year && !month) {
      year = now.getFullYear();
    }
    const { Patient } = require('../models');
    let where = { bookingStatus: 'Đã hoàn thành' };
    if (year && !month) {
      where.bookingDate = {
        [Op.between]: [`${year}-01-01`, `${year}-12-31`],
      };
    } else if (month) {
      if (!year) year = now.getFullYear();
      const start = `${year}-${month.padStart(2, '0')}-01`;
      const end = new Date(year, parseInt(month), 0).toISOString().slice(0, 10);
      where.bookingDate = {
        [Op.between]: [start, end],
      };
    }
    // Get all patients
    const patients = await Patient.findAll({
      attributes: ['id', 'patientName'],
      raw: true,
    });
    // Get total amount for each patient
    const patientStats = await Booking.findAll({
      where,
      attributes: [
        'patientId',
        [
          Booking.sequelize.fn('SUM', Booking.sequelize.col('bookingPrice')),
          'totalAmount',
        ],
      ],
      group: ['patientId'],
      raw: true,
    });
    // Merge all patients with stats, fill 0 if not found
    const result = patients.map((pat) => {
      const stat = patientStats.find((s) => s.patientId === pat.id);
      return {
        patientId: pat.id,
        patientName: pat.patientName,
        totalAmount: stat ? Number(stat.totalAmount) : 0,
      };
    });
    // Sort by totalAmount desc and return top 5
    result.sort((a, b) => b.totalAmount - a.totalAmount);
    return res.status(200).json(result.slice(0, 5));
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get top VIP patients failed', error: error.message });
  }
};

module.exports = {
  getRevenueStatistics,
  getDoctorRevenueStatistics,
  getTotalCompleteBookings,
  getAllDoctors,
  getTopVipPatients,
};
