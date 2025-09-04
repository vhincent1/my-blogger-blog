import express from 'express';

import { navbarController } from '../controller/navbar.controller.js';

import apiRouter from './api/index.js';
import indexRouter from './homepage/index.js';
import authRouter from './auth.routes.js';
import postsRouter from './posts.routes.js';

import { apiLimiter } from '../middleware/limiter.middleware.js';

const app = express.Router();

// render common variables
app.use((req, res, next) => {
  res.locals.navbar = navbarController;
  res.locals.previousUrl = req.headers.referer || '/';
  next();
});

app.use('/', indexRouter);
app.use('/login', authRouter);

app.use('/posts', postsRouter);

app.use('/api/v1', apiLimiter, apiRouter);
app.get('/api/v2', async (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

export default app;
