require('dotenv').config();
const express = require("express")
const connectToDB = require("./config/Sql")
const configViewsEngine = require('./config/configEngine')
const api = require('./router/API')

//const cors = require("cors")
//const configViewsEngine = require ('./config/configEngine.js')
const START_SERVER = ()=>{
    const app = express()

    const HOST = process.env.HOST || 'localhost'
    const PORT =process.env.PORT   || 8080

    //app.use(cors)
    configViewsEngine(app) 
    app.use("/v1/api", api)
    app.get("/",async (req,res)=>{    
        res.send('<h1>Welcome to Tuanh is Website </h1>')
    })

    app.listen( PORT, HOST, () => {
        console.log(`\n3. Server is running at http://${HOST}:${PORT}`)
    });
}
console.log("\n1.Connected to Sql Server")
connectToDB()
    .then(() => console.log('\n2. Connected to Sql Database'))
    .then(() => START_SERVER())
    .catch( error  => {
        console.log(error)
        process.exit(0)
    })


