import express from 'express';
import emojis from './emojis.ts';

import { performance } from 'node:perf_hooks';

import { pageController } from '../../controller/page.controller.ts';

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
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/emojis', emojis);

router.use('/posts', async (req, res) => {
  const t0 = performance.now();
  const controller = await pageController.pagination(req, {
    page: 0,
    limit: 10,
  });
  if (controller.currentPage > controller.totalPages)
    return res.status(404).json({ error: 'Page limit exceeded' });

  res.status(200).json(controller.posts);

  const t1 = performance.now();
  console.log(`Fetch request took ${t1 - t0} milliseconds.`);
});

// like widget
router.post('/posts/:postId/like', async (req, res) => {
  const itemId = req.params.itemId;
  const userId = req.user.id; // Assuming user authentication and req.user is populated
  try {
    // Check if the user has already liked/disliked this item
    const existingLike = await db.query('SELECT * FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
    let newLikeCount;
    if (existingLike.length > 0) {
      // User already liked, so unlike it (or toggle dislike)
      await db.query('DELETE FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
      newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
    } else {
      // User has not liked, so add a like
      await db.query('INSERT INTO likes (item_id, user_id, value) VALUES (?, ?, 1)', [itemId, userId]);
      newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
    }
    res.json({ message: 'Like status updated', newLikeCount: newLikeCount[0].count });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;