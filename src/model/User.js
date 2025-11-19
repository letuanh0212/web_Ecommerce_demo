const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : String,
    age : Number,
    phone_number: Number,
    email : String,
    password : String,
    role : { 
        type: String, 
        enum: ['user', 'admin', 'seller'],
        default: 'user'
    },
},{ timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;