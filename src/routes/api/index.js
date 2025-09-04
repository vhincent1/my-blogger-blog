import express from 'express';
import emojis from './emojis.js';

import { performance } from 'node:perf_hooks';

import { pageController } from '../../controller/page.controller.js';

const router = express.Router();

//curl -H "x-api-key: your_super_secret_api_key_here" http://localhost:3000/protected-data
// const authenticateApiKey = (req, res, next) => {
//   const apiKeyFromRequest = req.headers['x-api-key'] || req.query.api_key;

//   if (!apiKeyFromRequest || apiKeyFromRequest !== API_KEY) {
//     return res.status(401).json({ message: 'Unauthorized: Invalid or missing API key.' });
//   }
//   next(); // Proceed to the next middleware or route handler
// };

// // Apply the middleware to protected routes
// app.get('/protected-data', authenticateApiKey, (req, res) => {
//   res.json({ message: 'This is protected data!' });
// });

// // Unprotected route
// app.get('/public-data', (req, res) => {
//   res.json({ message: 'This is public data.' });
// });

router.get('/', async (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/emojis', emojis);

async function handle(req, res) {}

router.use('/posts', async (req, res) => {
  const t0 = performance.now();
  const controller = await pageController.pagination(req, {
    page: 0,
    limit: 10,
  });
  if (controller.currentPage > controller.totalPages)
    return res.status(404).json({ error: 'Page limit exceeded' });

  res.status(200).json(controller.posts);

  const t1 = performance.now();
  console.log(`Fetch request took ${t1 - t0} milliseconds.`);
});

export default router;
