const {
  Doctor,
  Account,
  Specialty,
  PaymentMethod,
  DoctorSchedule,
  Schedule,
} = require('../models');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Create a new doctor and associated account
const createDoctor = async (req, res) => {
  try {
    const {
      username,
      password,
      userGender,
      userDoB,
      userAddress,
      email,
      doctorTitle,
      doctorName,
      doctorSortDesc,
      doctorDetailDesc,
      examinationPrice,
      specialtyId,
      paymentMethodIds,
    } = req.body;

    let userAvatar = null;

    if (req.file) {
      userAvatar = `/images/${req.file.filename}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create account
    const account = await Account.create({
      username,
      password: hashedPassword,
      userGender,
      userDoB,
      userAddress,
      userAvatar,
      email,
      role: 'doctor',
    });
    // Create doctor
    const doctor = await Doctor.create({
      doctorTitle,
      doctorName,
      doctorSortDesc,
      doctorDetailDesc,
      examinationPrice,
      accountId: account.id,
      specialtyId,
    });
    // Associate payment methods if provided
    let paymentIds = paymentMethodIds;
    if (paymentIds) {
      if (typeof paymentIds === 'string') {
        // Handle comma-separated or single value
        paymentIds = paymentIds.split(',').map((id) => id.trim());
      }
      if (!Array.isArray(paymentIds)) {
        paymentIds = [paymentIds];
      }
      await doctor.setPaymentMethods(paymentIds);
    }
    return res.status(201).json({ message: 'Doctor created', doctor, account });
  } catch (error) {
    console.error('[ERR] Error creating doctor:', error);
    return res
      .status(500)
      .json({ message: 'Create doctor failed', error: error.message });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Account,
          as: 'account',
          attributes: {
            exclude: [
              'password',
              'createdAt',
              'updatedAt',
              'resetToken',
              'resetTokenExpire',
            ],
          },
        },
        {
          model: Specialty,
          as: 'specialty',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: PaymentMethod,
          as: 'paymentMethods',
          through: { attributes: [] },
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: DoctorSchedule,
          as: 'doctorSchedules',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: Schedule,
              as: 'schedule',
              attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
          ],
        },
      ],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    return res.status(200).json(doctors);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get doctors failed', error: error.message });
  }
};

// Get doctor by id
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: Account,
          as: 'account',
          attributes: {
            exclude: [
              'password',
              'createdAt',
              'updatedAt',
              'resetToken',
              'resetTokenExpire',
            ],
          },
        },
        {
          model: Specialty,
          as: 'specialty',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: PaymentMethod,
          as: 'paymentMethods',
          through: { attributes: [] },
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: DoctorSchedule,
          as: 'doctorSchedules',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: Schedule,
              as: 'schedule',
              attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
          ],
        },
      ],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    return res.status(200).json(doctor);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get doctor failed', error: error.message });
  }
};

const getDoctorBySpecialty = async (req, res) => {
  try {
    const { specialtyId } = req.params;
    const doctors = await Doctor.findAll({
      where: { specialtyId },
      include: [
        {
          model: Account,
          as: 'account',
          attributes: {
            exclude: [
              'password',
              'createdAt',
              'updatedAt',
              'resetToken',
              'resetTokenExpire',
            ],
          },
        },
        {
          model: Specialty,
          as: 'specialty',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: PaymentMethod,
          as: 'paymentMethods',
          through: { attributes: [] },
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    if (!doctors || doctors.length === 0) {
      return res
        .status(404)
        .json({ message: 'No doctors found for this specialty' });
    }
    return res.status(200).json(doctors);
  } catch (error) {
    return res.status(500).json({
      message: 'Get doctors by specialty failed',
      error: error.message,
    });
  }
};

// Update doctor and account
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      doctorTitle,
      doctorName,
      doctorSortDesc,
      doctorDetailDesc,
      examinationPrice,
      specialtyId,
      paymentMethodIds,
      userGender,
      userDoB,
      userAddress,
    } = req.body;
    const doctor = await Doctor.findByPk(id, {
      include: [{ model: Account, as: 'account' }],
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    // Update doctor fields
    doctor.doctorTitle = doctorTitle || doctor.doctorTitle;
    doctor.doctorName = doctorName || doctor.doctorName;
    doctor.doctorSortDesc = doctorSortDesc || doctor.doctorSortDesc;
    doctor.doctorDetailDesc = doctorDetailDesc || doctor.doctorDetailDesc;
    doctor.examinationPrice = examinationPrice || doctor.examinationPrice;
    doctor.specialtyId = specialtyId || doctor.specialtyId;
    await doctor.save();
    // Update payment methods
    let updatePaymentIds = paymentMethodIds;
    if (updatePaymentIds) {
      if (typeof updatePaymentIds === 'string') {
        updatePaymentIds = updatePaymentIds.split(',').map((id) => id.trim());
      }
      if (!Array.isArray(updatePaymentIds)) {
        updatePaymentIds = [updatePaymentIds];
      }
      await doctor.setPaymentMethods(updatePaymentIds);
    }
    // Update account fields
    if (doctor.account) {
      doctor.account.userGender = userGender || doctor.account.userGender;
      doctor.account.userDoB = userDoB || doctor.account.userDoB;
      doctor.account.userAddress = userAddress || doctor.account.userAddress;
      if (req.file) {
        if (doctor.account.userAvatar) {
          const oldPath = path.join(__dirname, '..', doctor.account.userAvatar);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        doctor.account.userAvatar = `/images/${req.file.filename}`;
      }
      await doctor.account.save();
    }
    return res.status(200).json({ message: 'Doctor updated', doctor });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Update doctor failed', error: error.message });
  }
};

// Delete doctor and associated account
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id, {
      include: [{ model: Account, as: 'account' }],
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (doctor.account) await doctor.account.destroy();
    await doctor.destroy();
    return res.status(200).json({ message: 'Doctor deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Delete doctor failed', error: error.message });
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorBySpecialty,
  updateDoctor,
  deleteDoctor,
};
