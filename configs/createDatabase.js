const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT || 3306,
      user: DB_USER,
      password: DB_PASS,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log(`Database '${DB_NAME}' is ready.`);
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

module.exports = createDatabase;
