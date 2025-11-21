const express = require("express");
const routerAPI = require("express").Router();
const { poolPromise, sql } = require("../config/Sql");

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

module.exports = routerAPI;

 