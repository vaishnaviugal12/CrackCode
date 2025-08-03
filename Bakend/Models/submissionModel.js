import mongoose from "mongoose";
const {Schema} =mongoose;


const submissionSchema= new Schema({
  userId:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
    
  },
  problemId:{
   type:Schema.Types.ObjectId,
   ref:"problem",
    required:true
    
  },
  language:{
    type:String,
    required:true,
    enum:['javascript','python','cpp','c','java','typescript']

  },
  code:{
    type:String,
    required:true
  },
  status:{
    type:String,
    enum:['pending','Accepted','Wrong','Error'],
    default:'pending'
  },
 runtime:{
    type:Number,
    default:0

  },
  memory:{
    type:Number,
    required:0
  },
  errorMessage:{
    type:String,
    default:''
  },
  testCasesPassed:{
    type:Number,
    default:0
  },
  testCasesTotal:{
  type:Number,
  default:0
  },

}, 
{
    timestamps:true

});

submissionSchema.index({userId:1, problemId:1})

const submission = mongoose.model('submission', submissionSchema);
export default submission;