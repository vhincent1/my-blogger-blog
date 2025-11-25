import express from 'express';

const router = express.Router();

//unused
router.get('/memory-status', (req, res) => {
  const formatMemoryUsage = (data) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
  const memoryData = process.memoryUsage();
  const memoryUsage = {
    rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };
  res.json(memoryUsage);
});

export default router;
