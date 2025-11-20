require('dotenv').config();
const sql = require('mssql')
// khi kết nối cần bật SQL Server lên và mở cái tcp/ip trong SQL Server Configuration Manager
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, 
    trustServerCertificate: false 
  }
}

async function connectToDB() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query('SELECT * FROM sys.tables');
    //console.log(result);
    console.log("Connected to DB successfully!");

  } catch (err) {
    console.error("ERROR connecting to Database!!!!!!", err);
  }
}

module.exports = connectToDB;