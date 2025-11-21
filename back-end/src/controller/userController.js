require('dotenv').config();
const { createUserService,loginUserService } = require('../service/userService');
const jwt = require("jsonwebtoken");


const createUser = async(req, res) => {
  console.log("Check request>>>>>>>>>>>> ", req.body);
  const { name,email, phone, address, password} = req.body;
  const data =  await createUserService(name,email, phone, address, password)
  return res.status(201).json({'message': 'User created successfully' });
}  

const loginUser = async(req, res) => {
  console.log("check request>>>>>>>>>>>> ", req.body);
  const { name, password } = req.body;
  const data = await loginUserService(name, password);
  if (!data.success) {
    return res.status(400).json({ message: data.message });
  }

  const user = data.user;
  const token = jwt.sign({
      id: user.id,
      name: user.name,
      role: user.role
  },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  return res.status(200).json({
    message: "Login successful",
    token: token,
    user: user
  });
}  


module.exports = {createUser,loginUser};