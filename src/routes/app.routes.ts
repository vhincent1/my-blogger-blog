import express from 'express';

import appConfig from '../app.config.ts';

import { navbarController } from '../controller/navbar.controller.ts';

import apiRouter from './api/v1/index.ts';
import apiV2Router from './api/v2/index.ts';
import authRouter from './auth.routes.ts';
import indexRouter from './homepage/index.ts';
import postsRouter from './posts.routes.ts';
import rssRouter from './api/v1/rss.ts';

import { apiLimiter } from '../middleware/limiter.middleware.ts';

const app = express.Router();

// render common variables
app.use((req, res, next) => {
  res.locals.common = {
    navbar: navbarController,
    previousUrl: req.headers.referer || '/',
    links: appConfig.ejs.links,
  };
  // const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  // console.log('Full URL:', fullUrl);
  next();
});

app.use('/api/v1', /*apiLimiter,*/ apiRouter);
app.use('/api/v2', apiV2Router);

app.use('/', indexRouter);
app.use('/login', authRouter);
app.use('/post', postsRouter);

app.use('/rss', rssRouter);

export default app;
