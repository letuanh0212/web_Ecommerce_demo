const express = require("express");
const routerAPI = require("express").Router();


routerAPI.get("/", async (req, res) => {
    return res.status(200).json( "Hello from API");
}  );

routerAPI.get("/register", async (req, res) => {
    return res.status(200).json( { data: "This is some data from POST /data" } );
}   );


module.exports = routerAPI;

 