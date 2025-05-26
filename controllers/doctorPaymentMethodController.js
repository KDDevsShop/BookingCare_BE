const { DoctorPaymentMethod, Doctor, PaymentMethod } = require('../models');

// Create a new doctor payment method (assign payment method to doctor)
const createDoctorPaymentMethod = async (req, res) => {
  try {
    const { doctorId, paymentMethodId } = req.body;
    // Prevent duplicate
    const exists = await DoctorPaymentMethod.findOne({
      where: { doctorId, paymentMethodId },
    });
    if (exists) {
      return res.status(400).json({
        message: 'This payment method is already assigned to the doctor.',
      });
    }
    const doctorPaymentMethod = await DoctorPaymentMethod.create({
      doctorId,
      paymentMethodId,
    });
    return res
      .status(201)
      .json({ message: 'Doctor payment method created', doctorPaymentMethod });
  } catch (error) {
    return res.status(500).json({
      message: 'Create doctor payment method failed',
      error: error.message,
    });
  }
};

// Get all doctor payment methods
const getAllDoctorPaymentMethods = async (req, res) => {
  try {
    const doctorPaymentMethods = await DoctorPaymentMethod.findAll({
      include: [
        { model: Doctor, as: 'doctor' },
        { model: PaymentMethod, as: 'paymentMethod' },
      ],
    });
    return res.status(200).json(doctorPaymentMethods);
  } catch (error) {
    console.error('[ERR] Error fetching doctor payment methods:', error);
    return res.status(500).json({
      message: 'Get doctor payment methods failed',
      error: error.message,
    });
  }
};

// Get doctor payment method by id
const getDoctorPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorPaymentMethod = await DoctorPaymentMethod.findByPk(id, {
      include: [
        { model: Doctor, as: 'Doctor' },
        { model: PaymentMethod, as: 'PaymentMethod' },
      ],
    });
    if (!doctorPaymentMethod)
      return res
        .status(404)
        .json({ message: 'Doctor payment method not found' });
    return res.status(200).json(doctorPaymentMethod);
  } catch (error) {
    return res.status(500).json({
      message: 'Get doctor payment method failed',
      error: error.message,
    });
  }
};

// Delete doctor payment method
const deleteDoctorPaymentMethod = async (req, res) => {
  try {
    const { doctorId, paymentMethodId } = req.params;
    if (!doctorId || !paymentMethodId) {
      return res
        .status(400)
        .json({ message: 'doctorId and paymentMethodId are required' });
    }
    const doctorPaymentMethod = await DoctorPaymentMethod.findOne({
      where: { doctorId, paymentMethodId },
    });
    if (!doctorPaymentMethod)
      return res
        .status(404)
        .json({ message: 'Doctor payment method not found' });
    await doctorPaymentMethod.destroy();
    return res.status(200).json({ message: 'Doctor payment method deleted' });
  } catch (error) {
    return res.status(500).json({
      message: 'Delete doctor payment method failed',
      error: error.message,
    });
  }
};

module.exports = {
  createDoctorPaymentMethod,
  getAllDoctorPaymentMethods,
  getDoctorPaymentMethodById,
  deleteDoctorPaymentMethod,
};
