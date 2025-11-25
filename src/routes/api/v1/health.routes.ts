import express from 'express';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

const startTime = new Date();
router.get('/', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    message: 'Hi - 👋🌎🌍🌏',
    date: startTime
  };
  try {
    res.status(StatusCodes.OK).json(healthCheck);
  } catch (error) {
    res.status(StatusCodes.SERVICE_UNAVAILABLE).json(healthCheck);
  }
});

export default router;
