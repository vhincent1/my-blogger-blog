import express from 'express';

/* routes */
import authRouter from './auth.ts'
import emojis from './emojis.ts';
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
router.use('/auth', authRouter);
/* upload form */
router.use('/upload', uploadRouter);
router.use('/emojis', emojis);
router.use('/inbox', inboxRouter);
// heart widget
router.use('/heart', /*authController.isAuthenticated,*/ heart);
router.use('/posts', postsRouter);
router.use('/archive', archiveRouter);
router.use('/labels', labelsRouter);

export default router;
