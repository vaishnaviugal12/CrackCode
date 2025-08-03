import redisClient from '../config/redis.js';
import User from '../Models/userModel.js';
import submission from '../Models/submissionModel.js';
import { validate } from "../utils/validator.js";
import bcrypt from "bcrypt";
import jwt, { decode } from 'jsonwebtoken';


const register = async (req, res) => {

    try {

        //validate the data
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role='user';

        //do not need to create for user laready exist beacause we have set email unique so one email can register only at aone time
        const user= await User.create(req.body);

        const token = jwt.sign({ _id: user._id, emailId: emailId ,role:'user'}, process.env.JWT_KEY, { expiresIn: 60 * 60 });

        const reply = {
            firstName:user.firstName,
            emailId:user.emailId,
            _id:user._id   }

        res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

        res.status(201).json({
            user:reply,
            message:"Register sucessfully"
        
        })
    }
    catch (error) {
        console.log(error);
        res.status(400).json({"Error":error});
    }

}

const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;

        if (!emailId)
            throw new Error("Invalid Credentials");

        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });

        const match =await bcrypt.compare(password, user.password);

        if (!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName:user.firstName,
            emailId:user.emailId,
            _id:user._id ,
        role:user.role }

        const token = jwt.sign({ _id: user._id, emailId: user.emailId ,role:user.role}, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
        res.status(201).json({
            user:reply,
            message:"Loggedin Suceesfully"
        
        })

    }
    catch (error) {
      return res.status(401).send("Error " + error);
    }
}


const logout = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).send("No token found in cookies");
    }

    const payload = jwt.decode(token);

    // Block the token in Redis
    await redisClient.set(`token:${token}`, "blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    // Clear the cookie
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "Lax",
    });

    res.send("Logout Successfully");
  } catch (error) {
    console.error("Logout error:", error);
    res.status(503).send("Logout Error: " + error.message);
  }
};


const adminRegister= async(req,res)=>{

    try {

        //validate the data
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role='admin';

        //do not need to create for user laready exist beacause we have set email unique so one email can register only at aone time
        const newUser= await User.create(req.body);

        const token = jwt.sign({ _id: newUser._id, emailId: emailId ,role:'admin'}, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

        res.status(201).send("User Registered Sucessfuly")
    }
    catch (error) {
        res.status(400).send("Error :" + error);
    }

}

const deleteProfile = async(req,res)=>{
 const userId = req.result._id;

try{
await User.findByIdAndDelete(userId);

await submission.deleteMany({userId})

res.status(200).send("Profile deleted sucessfully", deleteProfile);

}
catch(error){
res.status(500).send("Internal server error"+ error);
}
}


export { register, login, logout,adminRegister,deleteProfile};