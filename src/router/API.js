const express = require("express");
const routerAPI = require("express").Router();


routerAPI.get("/", async (req, res) => {
    return res.status(200).json( "Hello from API");
}  );

module.exports = routerAPI;

 