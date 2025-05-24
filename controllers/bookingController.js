const { Booking, Patient, Doctor, Prescription } = require('../models');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      bookingReason,
      bookingPrice,
      patientId,
      doctorId,
    } = req.body;
    const booking = await Booking.create({
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      bookingReason,
      bookingPrice,
      patientId,
      doctorId,
    });
    return res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Create booking failed', error: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Prescription, as: 'prescription' },
      ],
    });
    return res.status(200).json(bookings);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get bookings failed', error: error.message });
  }
};

// Get booking by id
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Prescription, as: 'prescription' },
      ],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    return res.status(200).json(booking);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get booking failed', error: error.message });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      bookingReason,
      bookingPrice,
      patientId,
      doctorId,
    } = req.body;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.bookingDate = bookingDate || booking.bookingDate;
    booking.bookingStartTime = bookingStartTime || booking.bookingStartTime;
    booking.bookingEndTime = bookingEndTime || booking.bookingEndTime;
    booking.bookingReason = bookingReason || booking.bookingReason;
    booking.bookingPrice = bookingPrice || booking.bookingPrice;
    booking.patientId = patientId || booking.patientId;
    booking.doctorId = doctorId || booking.doctorId;
    await booking.save();
    return res.status(200).json({ message: 'Booking updated', booking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Update booking failed', error: error.message });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.destroy();
    return res.status(200).json({ message: 'Booking deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Delete booking failed', error: error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
