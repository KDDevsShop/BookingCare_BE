const {
  Booking,
  Patient,
  Doctor,
  Prescription,
  DoctorSchedule,
  Schedule,
  Account,
} = require("../models");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      bookingReason,
      patientId,
      doctorId,
    } = req.body;

    if (new Date(bookingDate) < new Date()) {
      return res.status(400).json({
        message: "Booking date cannot be in the past",
      });
    }

    if (bookingStartTime >= bookingEndTime) {
      return res
        .status(400)
        .json({ message: "Booking start time must be before end time" });
    }

    if (
      !bookingDate ||
      !bookingStartTime ||
      !bookingEndTime ||
      !patientId ||
      !doctorId
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctorSchedules = await DoctorSchedule.findAll({
      where: { doctorId, workDate: bookingDate },
      include: [{ model: Schedule, as: "schedule" }],
    });

    const matchingSchedule = doctorSchedules.find((ds) => {
      if (!ds.schedule) {
        return false;
      }
      return (
        ds.schedule.startTime === bookingStartTime &&
        ds.schedule.endTime === bookingEndTime
      );
    });

    if (!matchingSchedule) {
      return res.status(400).json({
        message: "Không tìm thấy ca làm việc của bác sĩ vào thời gian này",
      });
    }

    if (!matchingSchedule.isAvailable) {
      return res.status(400).json({
        message:
          "Bác sĩ này không còn lịch rảnh vào thời gian này, vui lòng chọn thời gian khác",
      });
    }

    const newBooking = await Booking.create({
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      bookingReason,
      bookingPrice: doctor?.examinationPrice,
      patientId,
      doctorId,
    });

    await matchingSchedule.save();

    // Send booking confirmation email to patient
    const patient = await Patient.findByPk(patientId, {
      include: [{ model: Account, as: "account" }],
    });

    if (patient && patient.account && patient.account.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const confirmUrl = `http://localhost:5173/booking/confirm?bookingId=${newBooking.id}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.account.email,
        subject: "Xác nhận đặt lịch khám - BookingCare",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 12px; padding: 32px 24px; box-shadow: 0 2px 8px #e0e0e0;">
            <h2 style="color: #1976d2; margin-bottom: 16px;">Xác nhận đặt lịch khám</h2>
            <p style="font-size: 16px; color: #333;">Xin chào <b>${
              patient.patientName
            }</b>,</p>
            <p style="font-size: 15px; color: #333;">Cảm ơn bạn đã đặt lịch khám tại BookingCare. Dưới đây là thông tin chi tiết về lịch hẹn của bạn:</p>
            <ul style="font-size: 15px; color: #333;">
              <li><b>Ngày khám:</b> ${bookingDate}</li>
              <li><b>Thời gian:</b> ${bookingStartTime} - ${bookingEndTime}</li>
              <li><b>Bác sĩ:</b> ${doctor.doctorName}</li>
              <li><b>Lý do khám:</b> ${bookingReason || "Không có"}</li>
              <li><b>Giá khám:</b> ${doctor.examinationPrice?.toLocaleString(
                "vi-VN"
              )} VNĐ</li>
            </ul>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background: #1976d2; color: #fff; font-size: 16px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 8px #e0e0e0; transition: background 0.2s;">Xác nhận lịch khám</a>
            </div>
            <p style="font-size: 14px; color: #888;">Nếu bạn không thực hiện đặt lịch này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
            <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;" />
            <div style="font-size: 13px; color: #bbb; text-align: center;">&copy; ${new Date().getFullYear()} BookingCare. All rights reserved.</div>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    return res
      .status(201)
      .json({ message: "Booking created", booking: newBooking });
  } catch (error) {
    console.error("Create booking error: ", error);
    return res
      .status(500)
      .json({ message: "Create booking failed", error: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Patient, as: "patient", attributes: ["id", "patientName"] },
        { model: Doctor, as: "doctor", attributes: ["id", "doctorName"] },
      ],
    });
    return res.status(200).json(bookings);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Get bookings failed", error: error.message });
  }
};

// Get booking by id
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: {
            exclude: ["id", "accountId", "createdAt", "updatedAt"],
          },
          include: [
            {
              association: "account",
              attributes: {
                exclude: [
                  "password",
                  "createdAt",
                  "updatedAt",
                  "resetToken",
                  "resetTokenExpire",
                ],
              },
            },
          ],
        },
        {
          model: Doctor,
          as: "doctor",
          attributes: {
            exclude: [
              "id",
              "createdAt",
              "updatedAt",
              "accountId",
              "doctorSortDesc",
              "doctorDetailDesc",
              "specialtyId",
            ],
          },
        },
      ],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    // Always fetch all prescriptions for this booking
    const prescriptions = await Prescription.findAll({
      where: { bookingId: booking.id },
      order: [["createdDate", "DESC"]],
    });
    const bookingObj = booking.toJSON();
    bookingObj.prescription = prescriptions || [];
    return res.status(200).json(bookingObj);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Get booking failed", error: error.message });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bookingDate,
      bookingStartTime,
      bookingEndTime,
      bookingReason,
      bookingPrice,
      patientId,
      doctorId,
    } = req.body;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.bookingDate = bookingDate || booking.bookingDate;
    booking.bookingStartTime = bookingStartTime || booking.bookingStartTime;
    booking.bookingEndTime = bookingEndTime || booking.bookingEndTime;
    booking.bookingReason = bookingReason || booking.bookingReason;
    booking.bookingPrice = bookingPrice || booking.bookingPrice;
    booking.patientId = patientId || booking.patientId;
    booking.doctorId = doctorId || booking.doctorId;
    await booking.save();
    return res.status(200).json({ message: "Booking updated", booking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Update booking failed", error: error.message });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    await booking.destroy();
    return res.status(200).json({ message: "Booking deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Delete booking failed", error: error.message });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.bookingStatus === "Đã hủy") {
      return res.status(400).json({ message: "Booking đã bị hủy trước đó" });
    }
    // Check if current time is less than 1 hour before appointment
    const now = new Date();

    const bookingDateTime = new Date(
      `${booking.bookingDate}T${booking.bookingStartTime}`
    );

    const diffMs = bookingDateTime - now;
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMinutes <= 60) {
      return res.status(400).json({
        message: "Bạn chỉ có thể hủy lịch trước giờ hẹn ít nhất 1 tiếng.",
      });
    }

    booking.bookingStatus = "Đã hủy";
    await booking.save();

    const doctorSchedule = await DoctorSchedule.findOne({
      where: {
        doctorId: booking.doctorId,
        workDate: booking.bookingDate,
        scheduleStartTime: booking.bookingStartTime,
        scheduleEndTime: booking.bookingEndTime,
      },
      include: [{ model: Schedule, as: "schedule" }],
    });

    console.log("==================DEBUG==================");

    console.log("Doctor Schedule:", doctorSchedule);
    console.log("Booking Start Time:", booking.bookingStartTime);
    console.log("Booking End Time:", booking.bookingEndTime);
    console.log(
      "Doctor Schedule Start Time:",
      doctorSchedule?.schedule?.startTime
    );
    console.log("Doctor Schedule End Time:", doctorSchedule?.schedule?.endTime);
    console.log("Current Patients:", doctorSchedule?.currentPatients);

    if (
      doctorSchedule &&
      doctorSchedule.schedule &&
      doctorSchedule.schedule.startTime === booking.bookingStartTime &&
      doctorSchedule.schedule.endTime === booking.bookingEndTime
    ) {
      if (doctorSchedule.currentPatients > 0) {
        doctorSchedule.currentPatients -= 1;

        if (!doctorSchedule.isAvailable) {
          doctorSchedule.isAvailable = true;
        }
        await doctorSchedule.save();
      }
    }
    return res.status(200).json({ message: "Booking đã được hủy", booking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Cancel booking failed", error: error.message });
  }
};

// Get all bookings for a doctor by doctorId
const getDoctorBookings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required" });
    }
    // Get all bookings for the doctor, include all prescriptions as an array
    const bookings = await Booking.findAll({
      where: {
        doctorId,
        bookingStatus: { [require("sequelize").Op.ne]: "Chờ xác nhận" }, // Exclude 'Chờ xác nhận'
      },
      include: [
        { model: Patient, as: "patient", attributes: ["id", "patientName"] },
        { model: Prescription, as: "prescription" },
      ],
      order: [
        ["bookingDate", "DESC"],
        ["bookingStartTime", "DESC"],
        [{ model: Prescription, as: "prescription" }, "createdDate", "DESC"],
      ],
      distinct: true,
    });
    // Group prescriptions as array for each booking (Sequelize may flatten if 1:N)
    const result = [];
    const seen = new Set();
    for (const booking of bookings) {
      if (!seen.has(booking.id)) {
        // Find all prescriptions for this booking
        const allPrescriptions = bookings
          .filter((b) => b.id === booking.id)
          .flatMap((b) =>
            Array.isArray(b.prescription)
              ? b.prescription
              : b.prescription
              ? [b.prescription]
              : []
          );
        // Remove duplicate prescriptions by id
        const uniquePrescriptions = Object.values(
          allPrescriptions.reduce((acc, p) => {
            if (p && p.id) acc[p.id] = p;
            return acc;
          }, {})
        );
        // Clone booking and attach prescriptions array
        const bookingObj = booking.toJSON();
        bookingObj.prescription = uniquePrescriptions;
        result.push(bookingObj);
        seen.add(booking.id);
      }
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Get doctor bookings failed",
      error: error.message,
    });
  }
};

// Get all bookings for a patient by patientId (duplicate of getPatientBookingHistories for route consistency)
const getPatientBookings = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }
    const bookings = await Booking.findAll({
      where: { patientId },
      include: [
        { model: Doctor, as: "doctor", attributes: ["id", "doctorName"] },
        { model: Prescription, as: "prescription" },
      ],
      order: [
        ["bookingDate", "DESC"],
        ["bookingStartTime", "DESC"],
      ],
    });
    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      message: "Get patient bookings failed",
      error: error.message,
    });
  }
};

// Get all bookings for a patient by patientId
const getPatientBookingHistories = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ message: "patientId is required" });
    }
    const bookings = await Booking.findAll({
      where: { patientId },
      include: [
        { model: Doctor, as: "doctor", attributes: ["id", "doctorName"] },
        { model: Prescription, as: "prescription" },
      ],
      order: [
        ["bookingDate", "DESC"],
        ["bookingStartTime", "DESC"],
        [{ model: Prescription, as: "prescription" }, "createdDate", "DESC"],
      ],
      distinct: true,
    });
    // Group prescriptions as array for each booking
    const result = [];
    const seen = new Set();
    for (const booking of bookings) {
      if (!seen.has(booking.id)) {
        const allPrescriptions = bookings
          .filter((b) => b.id === booking.id)
          .flatMap((b) =>
            Array.isArray(b.prescription)
              ? b.prescription
              : b.prescription
              ? [b.prescription]
              : []
          );
        const uniquePrescriptions = Object.values(
          allPrescriptions.reduce((acc, p) => {
            if (p && p.id) acc[p.id] = p;
            return acc;
          }, {})
        );
        const bookingObj = booking.toJSON();
        bookingObj.prescription = uniquePrescriptions;
        result.push(bookingObj);
        seen.add(booking.id);
      }
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Get patient booking histories failed",
      error: error.message,
    });
  }
};

// Helper to find matching DoctorSchedule for a booking
async function findMatchingDoctorSchedule({
  doctorId,
  bookingDate,
  bookingStartTime,
  bookingEndTime,
}) {
  const doctorSchedules = await DoctorSchedule.findAll({
    where: { doctorId, workDate: bookingDate },
    include: [{ model: Schedule, as: "schedule" }],
  });
  return doctorSchedules.find(
    (ds) =>
      ds.schedule &&
      ds.schedule.startTime === bookingStartTime &&
      ds.schedule.endTime === bookingEndTime
  );
}

// Confirm booking by bookingId
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log(bookingId);
    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }
    const booking = await Booking.findByPk(parseInt(bookingId));
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    // Check DoctorSchedule as in createBooking
    const matchingSchedule = await findMatchingDoctorSchedule({
      doctorId: booking.doctorId,
      bookingDate: booking.bookingDate,
      bookingStartTime: booking.bookingStartTime,
      bookingEndTime: booking.bookingEndTime,
    });
    if (!matchingSchedule) {
      return res.status(400).json({
        message: "Không tìm thấy ca làm việc của bác sĩ vào thời gian này",
      });
    }
    if (!matchingSchedule.isAvailable) {
      return res.status(400).json({
        message:
          "Bác sĩ này không còn lịch rảnh vào thời gian này, vui lòng chọn thời gian khác",
      });
    }
    // Update booking status and DoctorSchedule & send email in parallel
    booking.bookingStatus = "Đã xác nhận";
    // Prepare doctor email logic
    const doctorPromise = (async () => {
      const doctor = await Doctor.findByPk(booking.doctorId, {
        include: [{ model: Account, as: "account" }],
      });
      if (doctor && doctor.account && doctor.account.email) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        const doctorUrl = `http://localhost:5173/doctor/booking/${booking.id}`;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: doctor.account.email,
          subject: "Lịch khám đã được xác nhận - BookingCare",
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 12px; padding: 32px 24px; box-shadow: 0 2px 8px #e0e0e0;">
              <h2 style="color: #1976d2; margin-bottom: 16px;">Lịch khám đã được xác nhận</h2>
              <p style="font-size: 16px; color: #333;">Xin chào <b>${
                doctor.doctorName
              }</b>,</p>
              <p style="font-size: 15px; color: #333;">Một lịch khám mới đã được xác nhận bởi bệnh nhân. Vui lòng kiểm tra chi tiết lịch hẹn bên dưới:</p>
              <ul style="font-size: 15px; color: #333;">
                <li><b>Mã lịch khám:</b> ${booking.id}</li>
                <li><b>Ngày khám:</b> ${booking.bookingDate}</li>
                <li><b>Thời gian:</b> ${booking.bookingStartTime} - ${
            booking.bookingEndTime
          }</li>
                <li><b>Trạng thái:</b> Đã xác nhận</li>
              </ul>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${doctorUrl}" style="display: inline-block; background: #1976d2; color: #fff; font-size: 16px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 8px #e0e0e0; transition: background 0.2s;">Xem chi tiết lịch khám</a>
              </div>
              <p style="font-size: 14px; color: #888;">Vui lòng đăng nhập vào hệ thống để xem thêm thông tin chi tiết về bệnh nhân và chuẩn bị cho buổi khám.</p>
              <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;" />
              <div style="font-size: 13px; color: #bbb; text-align: center;">&copy; ${new Date().getFullYear()} BookingCare. All rights reserved.</div>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
      }
    })();
    // Update DoctorSchedule
    const schedulePromise = (async () => {
      matchingSchedule.currentPatients += 1;
      await matchingSchedule.save();
    })();
    await Promise.all([booking.save(), doctorPromise, schedulePromise]);
    return res.status(200).json({ message: "Booking confirmed", booking });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Confirm booking failed", error: error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
  getPatientBookingHistories,
  getDoctorBookings,
  getPatientBookings,
  confirmBooking,
};
