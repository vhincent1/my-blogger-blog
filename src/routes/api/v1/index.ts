import express from 'express';
import { performance } from 'node:perf_hooks';
/* routes */
import emojis from './emojis.ts';
import healthRouter from './health.ts';
import inboxRouter from '../inbox.ts';
import pingRouter from './ping.ts';
import uploadRouter from './upload.ts';
import heart from './heart.ts';
/* services */
import { ServiceResponse } from '../../../model/ServiceResponse.model.ts';
import PostService from '../../../services/post.service.ts';
import { Post, type PostParameters } from '../../../model/Post.model.ts';
import { getPaginationParameters, getPaginatedData } from '../../../controller/pagination.controller.ts';

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

/* post  */
router.use('/posts/format', async (req, res) => {
  const placeholder = new Post(0);
  placeholder.title = 'Title';
  placeholder.content = 'Hi';
  placeholder.labels = ['label1', 'label2'];
  placeholder.date = {
    published: new Date(),
    updated: new Date(),
  }; //as PostDate
  placeholder.author = 'Author';
  res.status(200).json(placeholder);
});

router.use('/posts', async (req, res) => {
  const t0 = performance.now(); //timer
  const { page, limit, search, type, filter, exclude }: any = req.query;
  try {
    const serviceResponse = await PostService.getPosts({ search, type, filter, exclude, meta: { source: 'api/v1/posts' } });
    if (serviceResponse.success) {
      const posts: any = await serviceResponse.responseObject;
      // ----------------------------------
      const paginationParams = getPaginationParameters(req, {
        page: page || 1,
        limit: limit || 5,
      });
      const paginatedItems = await getPaginatedData(paginationParams, posts);
      if (paginatedItems.currentPage > paginatedItems.totalPages /*exceeds limit*/ || paginatedItems.currentPage < 0 /*is negative*/) return res.send(ServiceResponse.failure('Page limit exceeded', req.query, null, 404));
      res.send(ServiceResponse.success<any>('Posts found', req.query, paginatedItems));
    } else {
      res.send(serviceResponse);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items' });
  }
  const t1 = performance.now();
  console.log(`Fetch request took ${t1 - t0} milliseconds.`);
});

router.use('/average', async (req, res) => {
  const serviceResponse = await PostService.getPosts();
  const posts: any = serviceResponse.responseObject;

  // const calculateAverageDate = (posts) => {

  //   // 1. Validate that the posts array exists and is not empty
  //   if (!posts || !Array.isArray(posts) || posts.length === 0) {
  //     return res.status(400).json({ error: 'JSON body must contain a non-empty "posts" array.' });
  //   }

  //   // 2. Convert each date string to a timestamp and store in an array
  // const timestamps = posts.map(post => {
  //   // Assuming the date property is named 'createdAt'
  //   const date = new Date(post.date.published);
  //   return date.getTime();
  // });

  //   // 3. Calculate the sum of all timestamps
  //   const totalTimestamp = timestamps.reduce((sum, timestamp) => sum + timestamp, 0);
  //   // 4. Calculate the average timestamp
  //   const averageTimestamp = totalTimestamp / timestamps.length;
  //   // 5. Convert the average timestamp back to a readable Date object
  //   const averageDate = new Date(averageTimestamp);
  //   return averageDate
  // }

  // const averageDate: any = calculateAverageDate(posts)

  // let formattedTime = new Intl.DateTimeFormat('default', {
  //   hour12: true,
  //   hour: 'numeric',
  //   minute: 'numeric'
  // }).format(averageDate);

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

const childRouter = express.Router({ mergeParams: true });
router.use('/labels', childRouter, async (req, res) => {
  // const { search, type, exclude, filter}: any = req.query
  // const PostParameters: PostParameters = { search, type, filter, exclude }
  const serviceResponse = await PostService.getSortedLabels(req.query);
  return res.send(serviceResponse);
});

childRouter.use('/:author', async (req, res) => {
  const { author }: any = req.params;
  const serviceResponse = await PostService.getSortedLabels(author);
  return res.send(serviceResponse);
});

const archive = express.Router({ mergeParams: true });
router.use('/archive', archive, async (req, res) => {
  const { search, type, exclude, filter }: any = req.query;
  const serviceResponse = await PostService.getArchiveCount({ search, type, exclude, filter });
  res.send(serviceResponse);
});

const archiveYearly = express.Router({ mergeParams: true });
archive.use('/:year', archiveYearly, async (req, res) => {
  const { search, type }: any = req.query;
  const serviceResponse = await PostService.getPostCountByYear({ search, type });
  console.log('year');
  res.send(serviceResponse);
});

archiveYearly.use('/:month', async (req, res) => {
  console.log('month');
  res.send('month');
});

export default router;
