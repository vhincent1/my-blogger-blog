import express from 'express';

const router = express.Router();

let pingCount = 0;

router.post('/', async (req, res) => {
  const data = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let remoteIp = req.ip || req.connection.remoteAddress;
  console.log('Recieved :', { timestamp: Date.now(), data, clientIp });
  res.status(201).json({ message: 'pong', receivedData: true, pingCount: (pingCount = ++pingCount) });
});

export default router;
