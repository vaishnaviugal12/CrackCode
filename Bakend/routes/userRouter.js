import express from 'express';
import userMiddleware from '../middleware/userMiddleware.js';
import { register, login,logout,adminRegister,deleteProfile} from '../controllers/userController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';



const userRouter = express.Router();
userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/logout',userMiddleware, logout);
userRouter.delete('/deleteprofile',userMiddleware, deleteProfile);
userRouter.post('/admin/register',adminMiddleware,adminRegister);
userRouter.get('/check' , userMiddleware, ( (req,res)=>{
    const reply ={
        firstName:req.result.firstName,
        emialId:req.result.emialId,
        _id:req.result._id
    }
    res.status(200).json({
        user:reply,
        message:"Valid User"
    })
} ))
//getprofile
export default userRouter;
