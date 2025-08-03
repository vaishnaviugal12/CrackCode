import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import redisClient from "../config/redis.js";
 
const userMiddleware = async(req,res,next)=>{
  
    try{
      const token =req.cookies.token;

      if(!token)
        throw new Error("Token is not present");

      const payload = jwt.verify(token, process.env.JWT_KEY);

      const {_id} = payload
      if(!_id) 
        throw new Error("Invalid token");

      const result = await User.findById(_id);

      if(!result)
        throw new Error("User doesnt exist")


    //checking the token is present in redis blocklist or not 

    const isBlocked = await redisClient.exists(`token:${token}`);
    if(isBlocked)
      throw new Error("Invalid Token");

    req.result=result;
    next();
    
    }
    catch(error){
     return res.status(401).send("error"+error);
    }
}

export default userMiddleware;