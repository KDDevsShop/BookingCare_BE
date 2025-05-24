const { Schedule, DoctorSchedule } = require('../models');

// Create a new schedule
const createSchedule = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const schedule = await Schedule.create({ startTime, endTime });
    return res.status(201).json({ message: 'Schedule created', schedule });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Create schedule failed', error: error.message });
  }
};

// Get all schedules
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      include: [{ model: DoctorSchedule, as: 'doctorSchedules' }],
    });
    return res.status(200).json(schedules);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get schedules failed', error: error.message });
  }
};

// Get schedule by id
const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id, {
      include: [{ model: DoctorSchedule, as: 'doctorSchedules' }],
    });
    if (!schedule)
      return res.status(404).json({ message: 'Schedule not found' });
    return res.status(200).json(schedule);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get schedule failed', error: error.message });
  }
};

// Update schedule
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;
    const schedule = await Schedule.findByPk(id);
    if (!schedule)
      return res.status(404).json({ message: 'Schedule not found' });
    schedule.startTime = startTime || schedule.startTime;
    schedule.endTime = endTime || schedule.endTime;
    await schedule.save();
    return res.status(200).json({ message: 'Schedule updated', schedule });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Update schedule failed', error: error.message });
  }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);
    if (!schedule)
      return res.status(404).json({ message: 'Schedule not found' });
    await schedule.destroy();
    return res.status(200).json({ message: 'Schedule deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Delete schedule failed', error: error.message });
  }
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
