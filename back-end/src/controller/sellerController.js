// require('dotenv').config();
// const { CreateStoreService , checkStoreService} = require('../service/sellerService');
// const jwt = require("jsonwebtoken");

// const createStore = async(req, res) => {
//     console.log("Check request>>>>>>>>>>>> ", req.body);
//     const { storeName, sellerId, description, storeAddress, storePhone} = req.body;
//     const data =  await CreateStoreService(storeName, sellerId, description, storeAddress, storePhone)
//     return res.status(201).json(data);
// }


// const checkStoreController = async (sellerId) => {
//     try {
//         const data = await checkStoreService(sellerId);
//         return data;  
//     } catch (err) {
//         console.error(err);
//         throw err;   
//     }
// }


// module.exports = {createStore ,checkStoreController};



require('dotenv').config();
const { CreateStoreService , checkStoreService} = require('../service/sellerService');
const jwt = require("jsonwebtoken");

const createStore = async(req, res) => {
    try {
        // accept both frontend field names and new API names
        const storeName = req.body.storeName || req.body.name;
        const sellerId = req.body.sellerId || req.body.owner_id || (req.user && req.user.id);
        const description = req.body.description || req.body.desc || '';
        const storeAddress = req.body.storeAddress || req.body.store_address || '';
        const storePhone = req.body.storePhone || req.body.store_phone || '';

        // try to obtain seller email/name from authenticated user if available
        const sellerEmail = req.user?.email || req.body.sellerEmail || req.body.email || null;
        const sellerName = req.user?.name || req.body.sellerName || req.body.name || null;

        const data = await CreateStoreService(storeName, sellerId, description, storeAddress, storePhone, sellerEmail, sellerName);
        return res.status(data.success ? 201 : 400).json(data);
    } catch (err) {
        console.error('createStore error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
}


const checkStoreController = async (sellerId) => {
    try {
        const data = await checkStoreService(sellerId);
        return data;  
    } catch (err) {
        console.error(err);
        throw err;   
    }
}


module.exports = {createStore ,checkStoreController};