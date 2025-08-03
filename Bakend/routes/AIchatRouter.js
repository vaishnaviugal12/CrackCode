import express from 'express';
import userMiddleware from '../middleware/userMiddleware.js';
import solveDoubt from '../controllers/solveDoubt.js';

const AIrouter = express.Router();

AIrouter.post('/chat',userMiddleware, solveDoubt);

export default AIrouter;