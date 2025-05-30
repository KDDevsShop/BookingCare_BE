const { Specialty, Doctor } = require('../models');
const path = require('path');
const fs = require('fs');
const Account = require('../models/Account');

// Create a new specialty
const createSpecialty = async (req, res) => {
  try {
    const { specialtyName, specialtyDesc } = req.body;
    let specialtyImage = null;
    if (req.file) {
      specialtyImage = `/images/${req.file.filename}`;
    }
    const specialty = await Specialty.create({
      specialtyName,
      specialtyImage,
      specialtyDesc,
    });
    return res.status(201).json({ message: 'Specialty created', specialty });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Create specialty failed', error: error.message });
  }
};

// Get all specialties
const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.findAll({
      include: [{ model: Doctor, as: 'doctors' }],
    });
    return res.status(200).json(specialties);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get specialties failed', error: error.message });
  }
};

// Get specialty by id
const getSpecialtyById = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await Specialty.findByPk(id, {
      include: [
        {
          model: Doctor,
          as: 'doctors',
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
          ],
        },
      ],
    });
    if (!specialty)
      return res.status(404).json({ message: 'Specialty not found' });
    return res.status(200).json(specialty);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get specialty failed', error: error.message });
  }
};

// Update specialty
const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { speciltyName, specialtyDesc } = req.body;
    const specialty = await Specialty.findByPk(id);
    if (!specialty)
      return res.status(404).json({ message: 'Specialty not found' });
    specialty.speciltyName = speciltyName || specialty.speciltyName;
    specialty.specialtyDesc = specialtyDesc || specialty.specialtyDesc;
    if (req.file) {
      // Remove old image if exists
      if (specialty.specialtyImage) {
        const oldPath = path.join(__dirname, '..', specialty.specialtyImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      specialty.specialtyImage = `/images/${req.file.filename}`;
    }
    await specialty.save();
    return res.status(200).json({ message: 'Specialty updated', specialty });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Update specialty failed', error: error.message });
  }
};

// Delete specialty
const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await Specialty.findByPk(id);
    if (!specialty)
      return res.status(404).json({ message: 'Specialty not found' });
    // Remove image if exists
    if (specialty.specialtyImage) {
      const oldPath = path.join(__dirname, '..', specialty.specialtyImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await specialty.destroy();
    return res.status(200).json({ message: 'Specialty deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Delete specialty failed', error: error.message });
  }
};

module.exports = {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
};
