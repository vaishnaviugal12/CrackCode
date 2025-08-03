import mongoose from "mongoose";
const {Schema} =mongoose;


const userSchema= new Schema({
  firstName:{
    type:String,
    required:true,
    minLength:2,
    maxLength:20,
  },
  lastName:{
   type:String,
   minLength:3,
    maxLength:20,
  },
  emailId:{
    type:String,
    required:true,
    unique:true,
    immutable:true,

  },
  age:{
    type:Number,
    min:6,
    max:80,
  },
  role:{
    type:String,
    enum:['user','admin'],
    default:'user'
  },
  problemSolved:{
    type:[{
      type:Schema.Types.ObjectId,
      ref: "problem"
    }]
   

  },
  password:{
    type:String,
    required:true
  }
}, 
{
    timestamps:true

});

const User = mongoose.model('User', userSchema);
export default User;