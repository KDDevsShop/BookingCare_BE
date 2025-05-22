// server.js
require('dotenv').config();
const createDatabase = require('./configs/createDatabase');
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await createDatabase(); // Ensure the database exists
    await db.sequelize.sync({ alter: true }); // Sync models
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
})();
