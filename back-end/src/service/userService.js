require('dotenv').config();
const {poolPromise, sql} = require('../config/Sql');

const bcrypt = require('bcrypt');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const createUserService = async (name,email, phone, address, password) =>{
  
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const pool = await poolPromise;
    const result = await pool.request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.Int, phone)
      .input("address", sql.NVarChar, address)
      .input("password", sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Users (name, email, phone, address, password)
        VALUES (@name, @email, @phone, @address, @password)
      `);

    return result;
  } catch (err) {
    console.error("SQL Error:", err);
    throw err;
  }
};
module.exports = { createUserService };