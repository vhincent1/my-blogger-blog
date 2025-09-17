import express from 'express';

import appConfig from '../app.config.ts'

import { navbarController } from '../controller/navbar.controller.ts';

import apiRouter from './api/index.ts';
import indexRouter from './homepage/index.ts';
import authRouter from './auth.routes.ts';
import postsRouter from './posts.routes.ts';
import uploadRouter from './upload.routes.ts'

import { apiLimiter } from '../middleware/limiter.middleware.ts';

const app = express.Router();

// render common variables
app.use((req, res, next) => {
  res.locals.navbar = navbarController;
  res.locals.previousUrl = req.headers.referer || '/';
  res.locals.links = appConfig.ejs.links
  // const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  // console.log('Full URL:', fullUrl);
  next();
});

app.use('/', indexRouter);
app.use('/login', authRouter);
app.use('/posts', postsRouter);
app.use('/upload', uploadRouter)

app.use('/api/v1', apiLimiter, apiRouter);
app.get('/api/v2', async (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

export default app;
