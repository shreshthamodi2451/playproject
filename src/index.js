import dotenv from "dotenv";



import mongoose from 'mongoose';
import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';

// const dns = require("dns");

// // dns.setServers([
// //   "8.8.8.8",
// //   "8.8.4.4"
// // ]);


dotenv.config({
    path: "./.env"
});

connectDB();













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