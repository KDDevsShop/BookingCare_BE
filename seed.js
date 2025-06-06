const db = require('./models');
const bcrypt = require('bcrypt');

async function seedAccounts() {
  const accounts = [
    {
      username: 'bacsi1',
      password: await bcrypt.hash('12345678', 10),
      userGender: true,
      userDoB: '1980-01-01',
      userAddress: 'Hà Nội',
      email: 'bacsi1@benhvien.vn',
      role: 'doctor',
    },
    {
      username: 'bacsi2',
      password: await bcrypt.hash('12345678', 10),
      userGender: false,
      userDoB: '1985-02-02',
      userAddress: 'Hồ Chí Minh',
      email: 'bacsi2@benhvien.vn',
      role: 'doctor',
    },
    {
      username: 'benhnhan1',
      password: await bcrypt.hash('12345678', 10),
      userGender: true,
      userDoB: '1995-03-03',
      userAddress: 'Đà Nẵng',
      email: 'benhnhan1@benhvien.vn',
      role: 'patient',
    },
    {
      username: 'benhnhan2',
      password: await bcrypt.hash('12345678', 10),
      userGender: false,
      userDoB: '1990-04-04',
      userAddress: 'Cần Thơ',
      email: 'benhnhan2@benhvien.vn',
      role: 'patient',
    },
    {
      username: 'admin',
      password: await bcrypt.hash('12345678', 10),
      userGender: true,
      userDoB: '1970-05-05',
      userAddress: 'Hà Nội',
      email: 'admin@benhvien.vn',
      role: 'admin',
    },
  ];
  return db.Account.bulkCreate(accounts);
}

async function seedPatients() {
  const patients = [
    {
      patientName: 'Nguyễn Văn A',
      patientPhone: '0901234567',
      accountId: 3,
    },
    {
      patientName: 'Trần Thị B',
      patientPhone: '0912345678',
      accountId: 4,
    },
    {
      patientName: 'Lê Văn C',
      patientPhone: '0923456789',
      accountId: null,
    },
    {
      patientName: 'Phạm Thị D',
      patientPhone: '0934567890',
      accountId: null,
    },
    {
      patientName: 'Đỗ Văn E',
      patientPhone: '0945678901',
      accountId: null,
    },
  ];
  return db.Patient.bulkCreate(patients);
}

async function seedDoctors() {
  const doctors = [
    {
      doctorName: 'BS. Nguyễn Văn Khoa',
      doctorSortDesc: 'Chuyên gia Nội thần kinh',
      doctorDetailDesc:
        'Hơn 20 năm kinh nghiệm điều trị các bệnh lý thần kinh.',
      examinationPrice: 300000,
      accountId: 1,
      specialtyId: 1,
    },
    {
      doctorName: 'BS. Trần Thị Mai',
      doctorSortDesc: 'Chuyên gia Tim mạch',
      doctorDetailDesc: 'Bác sĩ đầu ngành về tim mạch tại Việt Nam.',
      examinationPrice: 350000,
      accountId: 2,
      specialtyId: 2,
    },
    {
      doctorName: 'BS. Lê Văn Hùng',
      doctorSortDesc: 'Chuyên gia Nhi khoa',
      doctorDetailDesc: 'Chuyên điều trị các bệnh lý trẻ em.',
      examinationPrice: 250000,
      accountId: null,
      specialtyId: 3,
    },
    {
      doctorName: 'BS. Phạm Thị Lan',
      doctorSortDesc: 'Chuyên gia Da liễu',
      doctorDetailDesc: 'Kinh nghiệm lâu năm trong điều trị da liễu.',
      examinationPrice: 280000,
      accountId: null,
      specialtyId: 4,
    },
    {
      doctorName: 'BS. Đỗ Văn Bình',
      doctorSortDesc: 'Chuyên gia Tiêu hóa',
      doctorDetailDesc: 'Bác sĩ tiêu hóa nổi tiếng miền Bắc.',
      examinationPrice: 320000,
      accountId: null,
      specialtyId: 5,
    },
  ];
  return db.Doctor.bulkCreate(doctors);
}

async function seedSpecialties() {
  const specialties = [
    {
      specialtyName: 'Thần kinh',
      specialtyImage: '',
      specialtyDesc: 'Chuyên khoa về các bệnh lý thần kinh.',
    },
    {
      specialtyName: 'Tim mạch',
      specialtyImage: '',
      specialtyDesc: 'Chuyên khoa về các bệnh lý tim mạch.',
    },
    {
      specialtyName: 'Nhi khoa',
      specialtyImage: '',
      specialtyDesc: 'Chuyên khoa dành cho trẻ em.',
    },
    {
      specialtyName: 'Da liễu',
      specialtyImage: '',
      specialtyDesc: 'Chuyên khoa về da.',
    },
    {
      specialtyName: 'Tiêu hóa',
      specialtyImage: '',
      specialtyDesc: 'Chuyên khoa về tiêu hóa.',
    },
  ];
  return db.Specialty.bulkCreate(specialties);
}

async function seedPaymentMethods() {
  const paymentMethods = [
    { paymentMethodName: 'Tiền mặt' },
    { paymentMethodName: 'Chuyển khoản ngân hàng' },
  ];
  return db.PaymentMethod.bulkCreate(paymentMethods);
}

async function seedSchedules() {
  const schedules = [
    { startTime: '08:00:00', endTime: '08:30:00' },
    { startTime: '08:30:00', endTime: '09:00:00' },
    { startTime: '09:00:00', endTime: '09:30:00' },
    { startTime: '10:30:00', endTime: '11:00:00' },
    { startTime: '11:00:00', endTime: '11:30:00' },
  ];
  return db.Schedule.bulkCreate(schedules);
}

async function seedDoctorSchedules() {
  const doctorSchedules = [
    {
      doctorId: 1,
      scheduleId: 1,
      workDate: '2025-05-27',
      currentPatients: 0,
      isAvailable: true,
    },
    {
      doctorId: 1,
      scheduleId: 2,
      workDate: '2025-05-27',
      currentPatients: 1,
      isAvailable: true,
    },
    {
      doctorId: 2,
      scheduleId: 3,
      workDate: '2025-05-27',
      currentPatients: 2,
      isAvailable: true,
    },
    {
      doctorId: 2,
      scheduleId: 4,
      workDate: '2025-05-27',
      currentPatients: 3,
      isAvailable: false,
    },
    {
      doctorId: 1,
      scheduleId: 3,
      workDate: '2025-05-28',
      currentPatients: 0,
      isAvailable: true,
    },
  ];
  return db.DoctorSchedule.bulkCreate(doctorSchedules);
}

async function seedBookings() {
  const bookings = [
    {
      bookingDate: '2025-05-27',
      bookingStartTime: '08:00:00',
      bookingEndTime: '10:00:00',
      bookingReason: 'Khám đau đầu',
      bookingPrice: 300000,
      patientId: 1,
      doctorId: 1,
      bookingStatus: 'Chờ xác nhận',
    },
    {
      bookingDate: '2025-05-27',
      bookingStartTime: '10:00:00',
      bookingEndTime: '12:00:00',
      bookingReason: 'Khám tim',
      bookingPrice: 350000,
      patientId: 2,
      doctorId: 2,
      bookingStatus: 'Đã xác nhận',
    },
    {
      bookingDate: '2025-05-27',
      bookingStartTime: '13:00:00',
      bookingEndTime: '15:00:00',
      bookingReason: 'Khám nhi',
      bookingPrice: 250000,
      patientId: 1,
      doctorId: 3,
      bookingStatus: 'Đã hoàn thành',
    },
    {
      bookingDate: '2025-05-27',
      bookingStartTime: '15:00:00',
      bookingEndTime: '17:00:00',
      bookingReason: 'Khám da liễu',
      bookingPrice: 280000,
      patientId: 2,
      doctorId: 4,
      bookingStatus: 'Đã hủy',
    },
    {
      bookingDate: '2025-05-28',
      bookingStartTime: '18:00:00',
      bookingEndTime: '20:00:00',
      bookingReason: 'Khám tiêu hóa',
      bookingPrice: 320000,
      patientId: 1,
      doctorId: 5,
      bookingStatus: 'Chờ xác nhận',
    },
  ];
  return db.Booking.bulkCreate(bookings);
}

async function seedPrescriptions() {
  const prescriptions = [
    { bookingId: 1, prescriptionImage: '', createdDate: new Date() },
    { bookingId: 2, prescriptionImage: '', createdDate: new Date() },
    { bookingId: 3, prescriptionImage: '', createdDate: new Date() },
    { bookingId: 4, prescriptionImage: '', createdDate: new Date() },
    { bookingId: 5, prescriptionImage: '', createdDate: new Date() },
  ];
  return db.Prescription.bulkCreate(prescriptions);
}

async function seedDoctorPaymentMethods() {
  const doctorPaymentMethods = [
    { doctorId: 1, paymentMethodId: 1 },
    { doctorId: 1, paymentMethodId: 2 },
    { doctorId: 2, paymentMethodId: 3 },
    { doctorId: 2, paymentMethodId: 4 },
    { doctorId: 3, paymentMethodId: 5 },
  ];
  return db.DoctorPaymentMethod.bulkCreate(doctorPaymentMethods);
}

async function seedFAQs() {
  const faqs = [
    {
      question: 'Làm thế nào để đặt lịch khám?',
      answer:
        'Bạn có thể đặt lịch khám qua website hoặc gọi điện trực tiếp đến bệnh viện.',
      isActive: true,
    },
    {
      question: 'Tôi có thể hủy lịch khám không?',
      answer: 'Bạn có thể hủy lịch trước 24h so với giờ khám đã đặt.',
      isActive: true,
    },
    {
      question: 'Bệnh viện có làm việc cuối tuần không?',
      answer: 'Bệnh viện làm việc từ thứ 2 đến chủ nhật.',
      isActive: true,
    },
    {
      question: 'Có thể thanh toán bằng thẻ không?',
      answer:
        'Bạn có thể thanh toán bằng thẻ tín dụng, chuyển khoản hoặc tiền mặt.',
      isActive: true,
    },
    {
      question: 'Tôi cần mang theo giấy tờ gì khi đi khám?',
      answer: 'Bạn cần mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có).',
      isActive: true,
    },
  ];
  return db.FAQ.bulkCreate(faqs);
}

async function seedAll() {
  await db.sequelize.sync({ force: true });
  await seedAccounts();
  await seedPatients();
  await seedSpecialties();
  await seedDoctors();
  await seedPaymentMethods();
  await seedSchedules();
  await seedDoctorSchedules();
  await seedBookings();
  await seedPrescriptions();
  await seedDoctorPaymentMethods();
  await seedFAQs();
  console.log('Seed dữ liệu hoàn tất!');
  process.exit(0);
}

if (require.main === module) {
  seedAll();
}

module.exports = {
  seedAccounts,
  seedPatients,
  seedDoctors,
  seedSpecialties,
  seedPaymentMethods,
  seedSchedules,
  seedDoctorSchedules,
  seedBookings,
  seedPrescriptions,
  seedDoctorPaymentMethods,
  seedFAQs,
  seedAll,
};
