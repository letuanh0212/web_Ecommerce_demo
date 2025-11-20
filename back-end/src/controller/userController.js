const { createUserService } = require('../service/userService');

const createUser = async(req, res) => {
  console.log("Check request>>>>>>>>>>>> ", req.body);
  const { name,email, phone, address, password} = req.body;
  const data =  await createUserService(name,email, phone, address, password)
  return res.status(201).json({'message': 'User created successfully' });
}  



module.exports =    createUser;