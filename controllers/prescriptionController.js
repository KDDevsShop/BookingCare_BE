const { Prescription, Booking } = require('../models');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { Patient, Account } = require('../models');
require('dotenv').config();

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

// Send prescription email to patient (new API)
const sendPrescriptionEmail = async (req, res) => {
  try {
    const { bookingId, prescriptionId } = req.body;
    if (!bookingId || !prescriptionId) {
      return res
        .status(400)
        .json({ message: 'bookingId and prescriptionId are required' });
    }
    const prescription = await Prescription.findByPk(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    // Update booking status to "Đã hoàn thành" before sending email
    booking.status = 'Đã hoàn thành';
    await booking.save();
    const patient = await Patient.findByPk(booking.patientId, {
      include: [{ model: Account, as: 'account' }],
    });
    if (patient && patient.account && patient.account.email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      let attachment = [];
      if (prescription.prescriptionImage) {
        const imagePath = path.join(
          __dirname,
          '..',
          prescription.prescriptionImage.replace(/^\/images\//, 'images/')
        );
        attachment = [
          {
            filename: path.basename(imagePath),
            path: imagePath,
          },
        ];
      }
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.account.email,
        subject: 'Đơn thuốc điện tử từ hệ thống BookingCare',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 12px; padding: 32px 24px; box-shadow: 0 2px 8px #e0e0e0;">
            <h2 style="color: #2e7d32; margin-bottom: 16px;">Đơn thuốc điện tử của bạn</h2>
            <p style="font-size: 16px; color: #333;">Xin chào <b>${
              patient.patientName
            }</b>,</p>
            <p style="font-size: 15px; color: #333;">Cảm ơn bạn đã sử dụng dịch vụ của BookingCare. Đơn thuốc của bạn đã được bác sĩ kê và gửi kèm trong email này.</p>
            <ul style="font-size: 15px; color: #333;">
              <li><b>Mã đặt lịch:</b> ${bookingId}</li>
              <li><b>Ngày tạo đơn thuốc:</b> ${prescription.createdDate.toLocaleString(
                'vi-VN'
              )}</li>
            </ul>
            <p style="font-size: 15px; color: #333;">Vui lòng kiểm tra file đính kèm để xem chi tiết đơn thuốc.</p>
            <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;" />
            <div style="font-size: 13px; color: #bbb; text-align: center;">&copy; ${new Date().getFullYear()} BookingCare. All rights reserved.</div>
          </div>
        `,
        attachments: attachment,
      };
      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        message:
          'Prescription email sent successfully, booking status updated to Đã hoàn thành',
      });
    } else {
      return res.status(404).json({ message: 'Patient email not found' });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Send prescription email failed',
      error: error.message,
    });
  }
};

module.exports = {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  sendPrescriptionEmail,
};
