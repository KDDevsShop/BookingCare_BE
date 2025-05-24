const { Doctor, Account, Specialty, PaymentMethod } = require('../models');
const path = require('path');
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
    // Create account
    const account = await Account.create({
      username,
      password, // Should be hashed in production
      userGender,
      userDoB,
      userAddress,
      userAvatar,
      email,
    });
    // Create doctor
    const doctor = await Doctor.create({
      doctorName,
      doctorSortDesc,
      doctorDetailDesc,
      examinationPrice,
      accountId: account.id,
      specialtyId,
    });
    // Associate payment methods if provided
    if (paymentMethodIds && Array.isArray(paymentMethodIds)) {
      await doctor.setPaymentMethods(paymentMethodIds);
    }
    return res.status(201).json({ message: 'Doctor created', doctor, account });
  } catch (error) {
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
        { model: Account, as: 'account' },
        { model: Specialty, as: 'specialty' },
        {
          model: PaymentMethod,
          as: 'paymentMethods',
          through: { attributes: [] },
        },
      ],
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
        { model: Account, as: 'account' },
        { model: Specialty, as: 'specialty' },
        {
          model: PaymentMethod,
          as: 'paymentMethods',
          through: { attributes: [] },
        },
      ],
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    return res.status(200).json(doctor);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get doctor failed', error: error.message });
  }
};

// Update doctor and account
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      doctorName,
      doctorSortDesc,
      doctorDetailDesc,
      examinationPrice,
      specialtyId,
      paymentMethodIds,
      username,
      userGender,
      userDoB,
      userAddress,
      email,
    } = req.body;
    const doctor = await Doctor.findByPk(id, {
      include: [{ model: Account, as: 'account' }],
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    // Update doctor fields
    doctor.doctorName = doctorName || doctor.doctorName;
    doctor.doctorSortDesc = doctorSortDesc || doctor.doctorSortDesc;
    doctor.doctorDetailDesc = doctorDetailDesc || doctor.doctorDetailDesc;
    doctor.examinationPrice = examinationPrice || doctor.examinationPrice;
    doctor.specialtyId = specialtyId || doctor.specialtyId;
    await doctor.save();
    // Update payment methods
    if (paymentMethodIds && Array.isArray(paymentMethodIds)) {
      await doctor.setPaymentMethods(paymentMethodIds);
    }
    // Update account fields
    if (doctor.account) {
      doctor.account.username = username || doctor.account.username;
      doctor.account.userGender = userGender || doctor.account.userGender;
      doctor.account.userDoB = userDoB || doctor.account.userDoB;
      doctor.account.userAddress = userAddress || doctor.account.userAddress;
      doctor.account.email = email || doctor.account.email;
      if (req.file) {
        // Remove old avatar if exists
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
  updateDoctor,
  deleteDoctor,
};
