const { Patient, Account } = require('../models');
const path = require('path');
const fs = require('fs');

// Get all patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{ model: Account, as: 'account' }],
    });
    return res.status(200).json(patients);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get patients failed', error: error.message });
  }
};

// Get patient by id
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id, {
      include: [{ model: Account, as: 'account' }],
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    return res.status(200).json(patient);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get patient failed', error: error.message });
  }
};

// Update patient and account
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, patientPhone, userGender, userDoB, userAddress } =
      req.body;
    const patient = await Patient.findByPk(id, {
      include: [{ model: Account, as: 'account' }],
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    // Update patient fields
    patient.patientName = patientName || patient.patientName;
    patient.patientPhone = patientPhone || patient.patientPhone;
    await patient.save();
    // Update account fields
    if (patient.account) {
      patient.account.userGender = userGender || patient.account.userGender;
      patient.account.userDoB = userDoB || patient.account.userDoB;
      patient.account.userAddress = userAddress || patient.account.userAddress;
      if (req.file) {
        // Remove old avatar if exists
        if (patient.account.userAvatar) {
          const oldPath = path.join(
            __dirname,
            '..',
            patient.account.userAvatar
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        patient.account.userAvatar = `/images/${req.file.filename}`;
      }
      await patient.account.save();
    }
    return res.status(200).json({ message: 'Patient updated', patient });
  } catch (error) {
    return res.status(500).json({
      message: 'Update patient failed',
      error: error?.message || error,
    });
  }
};

// Delete patient and account
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id, {
      include: [{ model: Account, as: 'account' }],
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    // Remove avatar if exists
    if (patient.account && patient.account.userAvatar) {
      const oldPath = path.join(__dirname, '..', patient.account.userAvatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    // Delete account if exists
    if (patient.account) {
      await patient.account.destroy();
    }
    // Delete patient
    await patient.destroy();
    return res.status(200).json({ message: 'Patient deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: 'Delete patient failed',
        error: error?.message || error,
      });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
