import express from "express";
import userMiddleware from "../middleware/userMiddleware.js";
import {submitCode,runCode} from "../controllers/userSubmission.js";


const submitRouter = express.Router();

submitRouter.post('/submitcode/:_id',userMiddleware, submitCode);
submitRouter.post('/runcode/:_id', userMiddleware, runCode);

export default submitRouter;