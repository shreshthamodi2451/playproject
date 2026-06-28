//through express

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app= express();
console.log("APP.JS LOADED");

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static("public"));
app.use(cookieParser());


//routes import
//Because default exports can be renamed when importing. so thats why userRouter works
import userRouter from './routes/user.routes.js'

//routes declaration, previoulsy all were in the same file so we could write app.get but now we have made a separate file for routes so we have to import it and use it here through app.use() which is middleware function that mounts the specified middleware function(s) at the path which is being specified. It is used to define the base path for the routes defined in the router.
//this is middleware making so as soon as user writes /users it will go to userRouter
//this is not chnaged the url will become like http://localhost:5000/users/register and it will go to userRouter and then it will go to the registerUser controller function which is defined in user.controller.js file
console.log("REGISTERING USER ROUTER");
app.use("/api/v1/users", userRouter);
//we go to /api/v1/users then userRouter will get activated, then it will got to user.routes.js the with /register it will go to registerUser controller function which is defined in user.controller.js file



export {app};