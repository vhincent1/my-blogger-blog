import express from 'express';
import RSS from 'rss';

const app = express.Router();

import { getPaginationParameters, getPaginatedData } from '../../../controller/pagination.controller.ts';

import PostService from '../../../services/post.service.ts';
// const serviceResponse = await PostService.getPosts({meta: {source: '/rss'}});
// let posts;
// if (serviceResponse.success) {
//   posts = await serviceResponse.responseObject;
//   // ----------------------------------
//   const paginationParams = getPaginationParameters(null, {
//     page: 1,
//     limit: 20,
//   });
//   const paginatedResult = await getPaginatedData(paginationParams, posts.reverse());

//   // Sort by date in ascending order
//   //   posts = paginatedResult.data.sort((a, b) => a.date.published.getTime() - b.date.published.getTime());

//   posts = paginatedResult.data;
// }

// /rss
app.get('/', (req, res) => {
  const feed = new RSS();

  //   posts.forEach((post) => {
  //     feed.item({
  //       title: post.title,
  //       description: post.content,
  //     //   feed_url: 'http://localhost:3000/generate-feed',
  //     //   site_url: 'http://localhost:3000',
  //     //   image_url: 'http://localhost:3000/logo.png',
  //     //   language: 'en',

  //     guid: 'second-post-id',
  //       pubDate: new Date(),
  //     });
  //   });

  res.set('Content-Type', 'application/xml');
  res.send(feed.xml());
});

export default app;
