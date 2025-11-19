const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    store_name: String,
    location: String,
    banner: String,
    logo: String,
    store_phone: Number,
    store_email: String,
    Owner: {
        type: mongoose.Schema.ObjectId, ref: 'User'}

});


const Store = mongoose.model('Store', storeSchema);

module.exports = Store;