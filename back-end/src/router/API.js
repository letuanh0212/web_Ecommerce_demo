const express = require("express");
const routerAPI = require("express").Router();
const { poolPromise, sql } = require("../config/Sql");
const verifyToken = require("../middleware/verify_token");
const checkRole = require('../middleware/verify_token');
const {createUser, loginUser} = require("../controller/userController");

// routerAPI.get("/user", async (req, res) => {
//     try{    
//         const pool = await poolPromise;
//         const result = await pool.request().query("SELECT * FROM Users");
//         res.json(result.recordset);
//     }  
//     catch(err){
//         return res.status(500).json( { message: err.message } );
//     }
// });

routerAPI.get("/", async (req, res) => {
    return res.status(200).json( { message: "API is working" } );
} );

routerAPI.post("/register", createUser);   

routerAPI.post('/login',loginUser);

routerAPI.get('/store', verifyToken, checkRole(['seller']), (req, res) => {
    res.json({ message: "Welcome seller!", user: req.user });
});

routerAPI.get('/admin-dashboard', verifyToken, checkRole(['admin']), (req, res) => {
    res.json({ message: "Welcome admin!", user: req.user });
});

module.exports = routerAPI;

 