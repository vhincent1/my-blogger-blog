import { getPaginatedData, getPaginationParameters } from '../../../controller/pagination.controller.ts';

import { Post } from '../../../model/Post.model.ts';
import PostService from '../../../services/post.service.ts';
/* services */
import { ServiceResponse } from '../../../model/ServiceResponse.model.ts';
/* routes */
import emojis from './emojis.ts';
import express from 'express';
import healthRouter from './health.ts';
import heart from './heart.ts';
import inboxRouter from './inbox.ts';
import pingRouter from './ping.ts';
import postsRouter from './posts.ts';
import uploadRouter from './upload.ts';
import labelsRouter from './labels.ts';
import archiveRouter from './archive.ts';

import { performance } from 'node:perf_hooks';

// api/v1
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

router.use('/health', healthRouter);
router.use('/ping', pingRouter);
/* upload form */
router.use('/upload', uploadRouter);
router.use('/emojis', emojis);
router.use('/inbox', inboxRouter);
// heart widget
router.use('/heart', /*authController.isAuthenticated,*/ heart);
router.use('/posts', postsRouter);
router.use('/archive', archiveRouter);
router.use('/labels', labelsRouter);

router.use('/average', async (req, res) => {
  const serviceResponse = await PostService.getPosts();
  const posts: any = await serviceResponse.responseObject;

  function getAverageTimeOfDay(dateArray) {
    if (!Array.isArray(dateArray) || dateArray.length === 0) return null; // Handle empty or invalid input
    let totalMilliseconds = 0;
    for (const date of dateArray) {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date object encountered in array:', date);
        continue; // Skip invalid date objects
      }
      // Get milliseconds since midnight for each date
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const milliseconds = date.getMilliseconds();
      const timeInMilliseconds = hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds;
      totalMilliseconds += timeInMilliseconds;
    }
    if (dateArray.length === 0) return null; // All dates were invalid or array became empty after filtering
    const averageMilliseconds = totalMilliseconds / dateArray.length;
    // Convert the average milliseconds back into a time string or Date object
    // Create a base date (e.g., January 1, 2000) and add the average time
    const baseDate = new Date(2000, 0, 1); // Year, Month (0-indexed), Day
    baseDate.setTime(baseDate.getTime() + averageMilliseconds);
    // Format the time as desired (e.g., HH:MM:SS)
    const averageHours = baseDate.getHours().toString().padStart(2, '0');
    const averageMinutes = baseDate.getMinutes().toString().padStart(2, '0');
    const averageSeconds = baseDate.getSeconds().toString().padStart(2, '0');
    return `${averageHours}:${averageMinutes}:${averageSeconds}`;
  }
  const timestamps = posts.map((post) => {
    // Assuming the date property is named 'createdAt'
    const date = new Date(post.date.published);
    return date;
  });
  const averageTimeOfDay = getAverageTimeOfDay(timestamps);
  // 6. Return the result
  res.json({
    averageTimeOfDay,
    // averagePostDate: averageDate.toISOString(),
    // rawTimestamp: averageTimestamp,
    // time: formattedTime
  });
});

export default router;
