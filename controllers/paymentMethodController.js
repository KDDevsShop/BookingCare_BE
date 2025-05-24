const { PaymentMethod, Doctor } = require('../models');

// Create a new payment method
const createPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodName } = req.body;
    const paymentMethod = await PaymentMethod.create({ paymentMethodName });
    return res
      .status(201)
      .json({ message: 'Payment method created', paymentMethod });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Create payment method failed', error: error.message });
  }
};

// Get all payment methods
const getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.findAll({
      include: [{ model: Doctor, as: 'doctors', through: { attributes: [] } }],
    });
    return res.status(200).json(paymentMethods);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get payment methods failed', error: error.message });
  }
};

// Get payment method by id
const getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethod = await PaymentMethod.findByPk(id, {
      include: [{ model: Doctor, as: 'doctors', through: { attributes: [] } }],
    });
    if (!paymentMethod)
      return res.status(404).json({ message: 'Payment method not found' });
    return res.status(200).json(paymentMethod);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get payment method failed', error: error.message });
  }
};

// Update payment method
const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethodName } = req.body;
    const paymentMethod = await PaymentMethod.findByPk(id);
    if (!paymentMethod)
      return res.status(404).json({ message: 'Payment method not found' });
    paymentMethod.paymentMethodName =
      paymentMethodName || paymentMethod.paymentMethodName;
    await paymentMethod.save();
    return res
      .status(200)
      .json({ message: 'Payment method updated', paymentMethod });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Update payment method failed', error: error.message });
  }
};

// Delete payment method
const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethod = await PaymentMethod.findByPk(id);
    if (!paymentMethod)
      return res.status(404).json({ message: 'Payment method not found' });
    await paymentMethod.destroy();
    return res.status(200).json({ message: 'Payment method deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Delete payment method failed', error: error.message });
  }
};

module.exports = {
  createPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
};
