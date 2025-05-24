// server.js
require('dotenv').config();
const createDatabase = require('./configs/createDatabase');
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 5000;
const shouldAlter = process.env.DB_SYNC_ALTER === 'true';

(async () => {
  try {
    await createDatabase(); // Ensure the database exists
    if (shouldAlter) {
      await db.sequelize.sync({ alter: true }); // Only alter if env is set
    } else {
      await db.sequelize.sync(); // Safe sync
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
})();
