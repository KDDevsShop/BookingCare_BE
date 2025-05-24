const { Prescription, Booking } = require('../models');
const path = require('path');
const fs = require('fs');

// Create a new prescription
const createPrescription = async (req, res) => {
  try {
    const { bookingId } = req.body;
    let prescriptionImage = null;
    if (req.file) {
      prescriptionImage = `/images/${req.file.filename}`;
    }
    const prescription = await Prescription.create({
      bookingId,
      prescriptionImage,
      createdDate: new Date(),
    });
    return res
      .status(201)
      .json({ message: 'Prescription created', prescription });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Create prescription failed', error: error.message });
  }
};

// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      include: [{ model: Booking, as: 'booking' }],
    });
    return res.status(200).json(prescriptions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get prescriptions failed', error: error.message });
  }
};

// Get prescription by id
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findByPk(id, {
      include: [{ model: Booking, as: 'booking' }],
    });
    if (!prescription)
      return res.status(404).json({ message: 'Prescription not found' });
    return res.status(200).json(prescription);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get prescription failed', error: error.message });
  }
};

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingId } = req.body;
    const prescription = await Prescription.findByPk(id);
    if (!prescription)
      return res.status(404).json({ message: 'Prescription not found' });
    prescription.bookingId = bookingId || prescription.bookingId;
    if (req.file) {
      // Remove old image if exists
      if (prescription.prescriptionImage) {
        const oldPath = path.join(
          __dirname,
          '..',
          prescription.prescriptionImage
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      prescription.prescriptionImage = `/images/${req.file.filename}`;
    }
    await prescription.save();
    return res
      .status(200)
      .json({ message: 'Prescription updated', prescription });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Update prescription failed', error: error.message });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findByPk(id);
    if (!prescription)
      return res.status(404).json({ message: 'Prescription not found' });
    // Remove image if exists
    if (prescription.prescriptionImage) {
      const oldPath = path.join(
        __dirname,
        '..',
        prescription.prescriptionImage
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await prescription.destroy();
    return res.status(200).json({ message: 'Prescription deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Delete prescription failed', error: error.message });
  }
};

module.exports = {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
};
