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


const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log(" Connected to DB successfully!");
    return pool;
  })
  .catch(err => console.log("ERROR connecting to Database!!!!!!", err));

module.exports = { sql, poolPromise };