import express from 'express';
import emojis from './emojis.ts';
import inboxRouter from './inbox.ts'
import { performance } from 'node:perf_hooks';

import Post from '../../model/Post.model.ts';
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

const startTime = new Date();
router.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    message: 'Hi - 👋🌎🌍🌏',
    date: startTime
  }
  try {
    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json(healthCheck)
  }
});

const inbox = []
let pingCount = 0

router.get('/ping', async (req, res) => {

})

import path from 'path'
import fs from 'fs'

router.post('/ping', async (req, res) => {
  const data = req.body
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let remoteIp = req.ip || req.connection.remoteAddress;
  console.log('Recieved :', { timestamp: Date.now(), data, clientIp })
  res.status(201).json({ message: 'pong', receivedData: true, pingCount: pingCount = ++pingCount });
});


// router.get('/memory-status', (req, res) => {
//   const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;

//   const memoryData = process.memoryUsage();

//   const memoryUsage = {
//     rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
//     heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
//     heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
//     external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
//   };
//   res.json(memoryUsage);
// });

router.use('/emojis', emojis);
router.use('/inbox', inboxRouter);

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

router.use('/posts/format', async (req, res) => {
  const placeholder = new Post(0)
  placeholder.title = 'Title'
  placeholder.content = 'Hi'
  placeholder.labels = ['label1', 'label2']
  placeholder.date = {
    published: new Date(),
    updated: new Date()
  } //as PostDate
  placeholder.author = 'Author'
  res.status(200).json(placeholder)
})

import { ServiceResponse } from '../../model/ServiceResponse.model.ts';
router.use('/posts', async (req, res) => {
  const t0 = performance.now(); //timer
  const { page, limit, search, type, filter, exclude }: any = req.query
  try {
    const postsResponse = await PostService.getPostsFiltered({ search, type, filter, exclude });
    if (postsResponse.success) {
      const posts: any = postsResponse.responseObject
      // ----------------------------------
      const paginationParams = getPaginationParameters(req, {
        page: page || 1,
        limit: limit || 5
      });
      const paginatedItems = await getPaginatedData(paginationParams, posts);
      if (paginatedItems.currentPage > paginatedItems.totalPages/*exceeds limit*/
        || paginatedItems.currentPage < 0 /*is negative*/)
        return res.send(ServiceResponse.failure('Page limit exceeded', null, 404));
      res.send(ServiceResponse.success<any>('Posts found', paginatedItems))
    } else {
      res.send(postsResponse)
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items' });
  }
  const t1 = performance.now();
  console.log(`Fetch request took ${t1 - t0} milliseconds.`);
})

export default router;