import express from 'express';
import adminMiddleware from '../middleware/adminMiddleware.js';
import userMiddleware from '../middleware/userMiddleware.js';
import {createProblem,updateProblem,getProblemById,getAllProblem,deleteProblem,allProblemsolvedByUeser,submittedProblem}  from '../controllers/problemController.js';



const problemrouter = express.Router();

problemrouter.post('/create',adminMiddleware,createProblem)

problemrouter.put('/update/:_id',adminMiddleware, updateProblem);
problemrouter.post('/delete/:_id',adminMiddleware, deleteProblem);

problemrouter.get('/getproblem/:_id',userMiddleware, getProblemById);
problemrouter.get('/getallproblem',userMiddleware,  getAllProblem);
problemrouter.get('/problemsolvedbyuser',userMiddleware,allProblemsolvedByUeser);
problemrouter.get('/submitedproblems/:id',userMiddleware, submittedProblem)
//as the above will give you all submission by the user for that one particular problem

export default problemrouter;















//create
//fetch
//delete
//update