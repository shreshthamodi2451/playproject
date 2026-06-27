import dotenv from "dotenv";
import { app } from "./app.js";


import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';
//import { app } from "./app.js";



dotenv.config({
    path: "./.env"
});


//after mongodb connected then express
connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port: ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("server connection failed!!!", err)
})













// import express from 'express';
// const app= express();

// ;( async () => {

//     try{
//        await mongoose.connect(`${process.env.MONGO_URI}`);
//        app.on("error", (error) => {
//         console.log("error: ", error);
//         throw error;
//        })


//        app.listen(process.env.PORT, () => {
//         console.log(`app is listening on port ${process.env.PORT}`);
//        })
//     }catch(error){
//         console.error("ERROR: ", error);
//         throw error;
//     }

// })()