import express from 'express';
const app = express();
import dotenv from 'dotenv';
import submitRouter from './routes/submitrouter.js';
import {main} from './config/db.js'
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import problemrouter from './routes/problemrouter.js';
import AIrouter from './routes/AIchatRouter.js';
import redisClient from './config/redis.js';
import cors from 'cors';
import mongoose from 'mongoose';

app.use(cors({
     origin: "http://localhost:5173",
     credentials :true
}));
//middleware fro converting the json data  from request body to javascript object
app.use(express.json());
app.use(cookieParser());
dotenv.config();







const InitializeConnection = async (req,res)=>{

try{
await Promise.all([main(),redisClient.connect()]);
console.log("DB connected");


    app.listen(process.env.PORT, ()=>{
console.log("Server listenng at the port :"+process.env.PORT);
})
  



} catch(error){
 console.log("error occured"+error)
}


}

InitializeConnection();

app.use("/api/user",userRouter);


app.use("/api/problem",problemrouter);

app.use("/api/submission",submitRouter);

app.use("/api/AI",AIrouter)
















