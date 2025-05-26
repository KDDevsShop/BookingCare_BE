const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/specialties', require('./routes/specialtyRoutes'));
app.use('/api/payment-methods', require('./routes/paymentMethodRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/doctor-schedules', require('./routes/doctorScheduleRoutes'));
app.use(
  '/api/doctor-payment-methods',
  require('./routes/doctorPaymentMethodRoutes')
);
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/images', express.static('images'));

module.exports = app;
