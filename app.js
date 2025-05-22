const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

// Import and use your routes here
// Example: app.use('/api/users', require('./routes/userRoutes'));

module.exports = app;
