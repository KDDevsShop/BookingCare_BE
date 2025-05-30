const {
  Booking,
  Patient,
  Doctor,
  Prescription,
  DoctorSchedule,
  Schedule,
} = require('../models');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      bookingReason,
      patientId,
      doctorId,
    } = req.body;

    if (new Date(bookingDate) < new Date()) {
      return res.status(400).json({
        message: 'Booking date cannot be in the past',
      });
    }

    if (bookingStartTime >= bookingEndTime) {
      return res
        .status(400)
        .json({ message: 'Booking start time must be before end time' });
    }

    if (
      !bookingDate ||
      !bookingStartTime ||
      !bookingEndTime ||
      !patientId ||
      !doctorId
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const doctorSchedules = await DoctorSchedule.findAll({
      where: { doctorId, workDate: bookingDate },
      include: [{ model: Schedule, as: 'schedule' }],
    });

    console.log(bookingDate, doctorId);

    console.log('doctorSchedules: ', doctorSchedules);

    const matchingSchedule = doctorSchedules.find((ds) => {
      if (!ds.schedule) {
        console.log('không okkkkkkkkkkkkk');
        return false;
      }
      console.log('okkkkkkkkkkkkkk');
      return (
        ds.schedule.startTime === bookingStartTime &&
        ds.schedule.endTime === bookingEndTime
      );
    });

    if (!matchingSchedule) {
      return res.status(400).json({
        message: 'Không tìm thấy ca làm việc của bác sĩ vào thời gian này',
      });
    }

    if (!matchingSchedule.isAvailable) {
      return res.status(400).json({
        message:
          'Bác sĩ này không còn lịch rảnh vào thời gian này, vui lòng chọn thời gian khác',
      });
    }

    const booking = await Booking.create({
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      bookingReason,
      bookingPrice: doctor?.examinationPrice,
      patientId,
      doctorId,
    });

    matchingSchedule.currentPatients += 1;
    await matchingSchedule.save();

    return res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    console.error('Create booking error: ', error);
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
        { model: Patient, as: 'patient', attributes: ['id', 'patientName'] },
        { model: Doctor, as: 'doctor', attributes: ['id', 'doctorName'] },
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
        {
          model: Patient,
          as: 'patient',
          attributes: {
            exclude: ['id', 'accountId', 'createdAt', 'updatedAt'],
          },
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: {
            exclude: [
              'id',
              'createdAt',
              'updatedAt',
              'accountId',
              'doctorSortDesc',
              'doctorDetailDesc',
              'specialtyId',
            ],
          },
        },
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

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.bookingStatus === 'Đã hủy') {
      return res.status(400).json({ message: 'Booking đã bị hủy trước đó' });
    }
    // Check if current time is less than 1 hour before appointment
    const now = new Date();
    const bookingDateTime = new Date(
      `${booking.bookingDate}T${booking.bookingStartTime}`
    );
    const diffMs = bookingDateTime - now;
    const diffMinutes = diffMs / (1000 * 60);
    if (diffMinutes <= 60) {
      return res.status(400).json({
        message: 'Bạn chỉ có thể hủy lịch trước giờ hẹn ít nhất 1 tiếng.',
      });
    }
    booking.bookingStatus = 'Đã hủy';
    await booking.save();
    // Giảm currentPatients của DoctorSchedule nếu có
    const doctorSchedule = await DoctorSchedule.findOne({
      where: {
        doctorId: booking.doctorId,
        workDate: booking.bookingDate,
      },
      include: [{ model: Schedule, as: 'schedule' }],
    });
    if (
      doctorSchedule &&
      doctorSchedule.schedule &&
      doctorSchedule.schedule.startTime === booking.bookingStartTime &&
      doctorSchedule.schedule.endTime === booking.bookingEndTime
    ) {
      if (doctorSchedule.currentPatients > 0) {
        doctorSchedule.currentPatients -= 1;
        // Nếu đã full trước đó thì mở lại lịch nếu cần
        if (!doctorSchedule.isAvailable) {
          doctorSchedule.isAvailable = true;
        }
        await doctorSchedule.save();
      }
    }
    return res.status(200).json({ message: 'Booking đã được hủy', booking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Cancel booking failed', error: error.message });
  }
};

// Get all bookings for a doctor by doctorId
const getDoctorBookings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId is required' });
    }
    const bookings = await Booking.findAll({
      where: { doctorId },
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'patientName'] },
        { model: Prescription, as: 'prescription' },
      ],
      order: [
        ['bookingDate', 'DESC'],
        ['bookingStartTime', 'DESC'],
      ],
    });
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      message: 'Get doctor bookings failed',
      error: error.message,
    });
  }
};

// Get all bookings for a patient by patientId (duplicate of getPatientBookingHistories for route consistency)
const getPatientBookings = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ message: 'patientId is required' });
    }
    const bookings = await Booking.findAll({
      where: { patientId },
      include: [
        { model: Doctor, as: 'doctor', attributes: ['id', 'doctorName'] },
        { model: Prescription, as: 'prescription' },
      ],
      order: [
        ['bookingDate', 'DESC'],
        ['bookingStartTime', 'DESC'],
      ],
    });
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      message: 'Get patient bookings failed',
      error: error.message,
    });
  }
};

// Get all bookings for a patient by patientId
const getPatientBookingHistories = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ message: 'patientId is required' });
    }
    const bookings = await Booking.findAll({
      where: { patientId },
      include: [
        { model: Doctor, as: 'doctor', attributes: ['id', 'doctorName'] },
        { model: Prescription, as: 'prescription' },
      ],
      order: [
        ['bookingDate', 'DESC'],
        ['bookingStartTime', 'DESC'],
      ],
    });
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      message: 'Get patient booking histories failed',
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
  getPatientBookingHistories,
  getDoctorBookings,
  getPatientBookings,
};
