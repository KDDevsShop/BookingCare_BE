const { FAQ } = require('../models');

// Create FAQ
const createFAQ = async (req, res) => {
  try {
    const { question, answer, isActive } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: 'Question and answer are required' });
    }
    const faq = await FAQ.create({ question, answer, isActive });
    return res.status(201).json({ message: 'FAQ created', faq });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Create FAQ failed', error: error.message });
  }
};

// Get all FAQs
const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.findAll();
    return res.status(200).json(faqs);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get FAQs failed', error: error.message });
  }
};

// Get FAQ by id
const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    return res.status(200).json(faq);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Get FAQ failed', error: error.message });
  }
};

// Update FAQ
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, isActive } = req.body;
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    if (isActive !== undefined) faq.isActive = isActive;
    await faq.save();
    return res.status(200).json({ message: 'FAQ updated', faq });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Update FAQ failed', error: error.message });
  }
};

// Delete FAQ
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    await faq.destroy();
    return res.status(200).json({ message: 'FAQ deleted' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Delete FAQ failed', error: error.message });
  }
};

module.exports = {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
};
