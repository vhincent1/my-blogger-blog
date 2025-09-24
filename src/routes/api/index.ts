import express from 'express';
import emojis from './emojis.ts';
import { performance } from 'node:perf_hooks';

import PostService from '../../services/post.service.ts'

import { pageController, getPaginationParameters, getPaginatedData } from '../../controller/page.controller.ts';
// import type { Pagination } from '../../controller/page.controller.ts';

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
  res.json({ message: 'Hi - 👋🌎🌍🌏' });
});
router.use('/emojis', emojis);

// router.use('/posts', async (req, res) => {
//   const t0 = performance.now();
//   try {
//     const parameters: Pagination = {
//       page: parseInt(req.query.page as string) || 0,
//       limit: parseInt(req.query.limit as string) || 10,
//       query: req.query.search as string,
//       type: req.query.type as string,
//     };
//     const serviceResponse = await PostService.getPosts(parameters);
//     const posts = serviceResponse.responseObject
//     parameters.data = posts
//     const controller = await pageController.pagination(req, parameters);
//     if (controller.currentPage > controller.totalPages)
//       return res.status(404).json({ error: 'Page limit exceeded' });
//     res.status(serviceResponse.statusCode).json({
//       items: controller.posts,
//       nextPageToken: controller.nextPageToken
//     });
//   } catch (ex) {
//     console.error('Failed to fetch data ', ex)
//     res.status(500).json({ error: 'failed' })
//   }
//   const t1 = performance.now();
//   console.log(`Fetch request took ${t1 - t0} milliseconds.`);
// });

router.use('/posts', async (req, res) => {
  const t0 = performance.now();
  try {
    const paginationParams = getPaginationParameters(req, { page: 1, limit: 5 });
    //todo: max page results
    if (paginationParams.limit > 50) {

    }
    const serviceResponse = await PostService.getPosts({
      search: req.query.search,
      type: req.query.type
    });
    if (serviceResponse.success) {
      let data: any
      const posts: any = serviceResponse.responseObject
      // filter
      const include = req.query.include || ''
      if (include) {
        const toInclude = (include as string).split(',')
        const desiredProperties = toInclude
        const filteredArray = posts.map(obj => {
          const newObj = {};
          for (const prop of desiredProperties)
            if (obj.hasOwnProperty(prop)) 
              newObj[prop] = obj[prop];
          return newObj;
        });
        data = filteredArray
      } else {
        data = posts
      }
      // ----------------------------------
      const paginatedItems = await getPaginatedData(paginationParams, data);
      if (paginatedItems.currentPage > paginatedItems.totalPages)
        return res.status(404).json({ error: 'Page limit exceeded' })
      res.status(serviceResponse.statusCode).json(paginatedItems);
    } else {
      res.status(serviceResponse.statusCode).json(serviceResponse)
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items' });
  }
  const t1 = performance.now();
  console.log(`Fetch request took ${t1 - t0} milliseconds.`);
})

export default router;