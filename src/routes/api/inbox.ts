import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { Worker } from 'node:worker_threads';
import { inboxLimiter } from '../../middleware/limiter.middleware.ts';

const router = express.Router();
//display inbox
router.get('/', async(req, res) => {


});

//recieve 
router.post('/', inboxLimiter, async(req, res)=>{
const data = req.body
    
  const worker = new Worker('../../workers/inbox.worker.js', { workerData: data });

  worker.on('message', (result) => {
    res.json({ fibonacci: result });
  });

  worker.on('error', (error) => {
    console.error('Worker error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  });
})

export default router;
