import express from 'express';
import emojis from './emojis.ts';
import inboxRouter from './inbox.ts'
import { performance } from 'node:perf_hooks';

import Post from '../../model/Post.model.ts';
import PostService from '../../services/post.service.ts'
import { getPaginationParameters, getPaginatedData } from '../../controller/pagination.controller.ts';
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
    const serviceResponse = await PostService.getPosts({ search, type, filter, exclude });
    if (serviceResponse.success) {
      const posts: any = serviceResponse.responseObject
      // ----------------------------------
      const paginationParams = getPaginationParameters(req, {
        page: page || 1,
        limit: limit || 5
      });
      const paginatedItems = await getPaginatedData(paginationParams, posts);
      if (paginatedItems.currentPage > paginatedItems.totalPages/*exceeds limit*/
        || paginatedItems.currentPage < 0 /*is negative*/)
        return res.send(ServiceResponse.failure('Page limit exceeded',req.query, null, 404));
      res.send(ServiceResponse.success<any>('Posts found',req.query, paginatedItems))
    } else {
      res.send(serviceResponse)
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items' });
  }
  const t1 = performance.now();
  console.log(`Fetch request took ${t1 - t0} milliseconds.`);
})

const childRouter = express.Router({ mergeParams: true });
router.use('/labels', childRouter, async (req, res) => {
  const { search, type, exclude, filter}: any = req.query
  const serviceResponse = await PostService.getSortedLabels(req.query);
  return res.send(serviceResponse)
})

childRouter.use('/:author', async (req, res) => {
  const { author }: any = req.params
  const serviceResponse = await PostService.getSortedLabels(author);
  return res.send(serviceResponse)
})

const archive = express.Router({ mergeParams: true });
router.use('/archive', archive, async (req, res) => {
  const { search, type, exclude, filter}: any = req.query
  const serviceResponse = await PostService.getArchiveCount({ search, type, exclude, filter })
  res.send(serviceResponse)
})

const archiveYearly = express.Router({ mergeParams: true });
archive.use('/:year', archiveYearly, async (req, res) => {
  const { search, type }: any = req.query
  const serviceResponse = await PostService.getPostCountByYear({ search, type })
  console.log('year')
  res.send(serviceResponse)
})

archiveYearly.use('/:month', async (req, res) => {
  console.log('month')
  res.send('month')
})

export default router;