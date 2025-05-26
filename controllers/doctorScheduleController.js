const { DoctorSchedule, Doctor, Schedule } = require('../models');

// Create a new doctor schedule (working shift)
const createDoctorSchedule = async (req, res) => {
  try {
    const { doctorId, scheduleId, workDate } = req.body;
    // Prevent duplicate shift for the same doctor, schedule, and date
    const exists = await DoctorSchedule.findOne({
      where: { doctorId, scheduleId, workDate },
    });
    if (exists) {
      return res.status(400).json({
        message:
          'This working shift already exists for the doctor on this date.',
      });
    }
    const doctorSchedule = await DoctorSchedule.create({
      doctorId,
      scheduleId,
      workDate,
    });
    return res
      .status(201)
      .json({ message: 'Doctor schedule created', doctorSchedule });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Create doctor schedule failed', error: error.message });
  }
};

// Get all doctor schedules
const getAllDoctorSchedules = async (req, res) => {
  try {
    const doctorSchedules = await DoctorSchedule.findAll({
      include: [
        { model: Doctor, as: 'doctor', attributes: ['id', 'doctorName'] },
        {
          model: Schedule,
          as: 'schedule',
        },
      ],
    });
    return res.status(200).json(doctorSchedules);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get doctor schedules failed', error: error.message });
  }
};

// Get doctor schedule by id
const getDoctorScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorSchedule = await DoctorSchedule.findByPk(id, {
      include: [
        { model: Doctor, as: 'doctor' },
        { model: Schedule, as: 'schedule' },
      ],
    });
    if (!doctorSchedule)
      return res.status(404).json({ message: 'Doctor schedule not found' });
    return res.status(200).json(doctorSchedule);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get doctor schedule failed', error: error.message });
  }
};

// Update doctor schedule
const updateDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, scheduleId, workDate } = req.body;
    const doctorSchedule = await DoctorSchedule.findByPk(id);
    if (!doctorSchedule)
      return res.status(404).json({ message: 'Doctor schedule not found' });
    // Prevent duplicate shift for the same doctor, schedule, and date
    if (doctorId && scheduleId && workDate) {
      const exists = await DoctorSchedule.findOne({
        where: { doctorId, scheduleId, workDate, id: { $ne: id } },
      });
      if (exists) {
        return res.status(400).json({
          message:
            'This working shift already exists for the doctor on this date.',
        });
      }
    }
    doctorSchedule.doctorId = doctorId || doctorSchedule.doctorId;
    doctorSchedule.scheduleId = scheduleId || doctorSchedule.scheduleId;
    doctorSchedule.workDate = workDate || doctorSchedule.workDate;
    await doctorSchedule.save();
    return res
      .status(200)
      .json({ message: 'Doctor schedule updated', doctorSchedule });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Update doctor schedule failed', error: error.message });
  }
};

// Delete doctor schedule by doctorId and scheduleId
const deleteDoctorSchedule = async (req, res) => {
  try {
    const { doctorId, scheduleId } = req.params;
    if (!doctorId || !scheduleId) {
      return res
        .status(400)
        .json({ message: 'doctorId and scheduleId are required' });
    }
    const doctorSchedule = await DoctorSchedule.findOne({
      where: { doctorId, scheduleId },
    });
    if (!doctorSchedule)
      return res.status(404).json({ message: 'Doctor schedule not found' });
    await doctorSchedule.destroy();
    return res.status(200).json({ message: 'Doctor schedule deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Delete doctor schedule failed', error: error.message });
  }
};

// Get all schedules for a doctor by doctorId
const getSchedulesByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId is required' });
    }
    const doctorSchedules = await DoctorSchedule.findAll({
      where: { doctorId },
      include: [
        { model: Doctor, as: 'doctor', attributes: ['id', 'doctorName'] },
        { model: Schedule, as: 'schedule' },
      ],
    });
    return res.status(200).json(doctorSchedules);
  } catch (error) {
    return res.status(500).json({
      message: 'Get schedules by doctor failed',
      error: error.message,
    });
  }
};

module.exports = {
  createDoctorSchedule,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateDoctorSchedule,
  deleteDoctorSchedule,
  getSchedulesByDoctorId,
};
