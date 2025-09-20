import express from 'express';

import authController from '../controller/auth.controller.ts';
import controller from '../controller/posts.controller.ts';

const route = express.Router();

// GET /post: To retrieve all blog posts.
// GET /post/:id: To retrieve a specific blog post by its ID.
// POST /post: To create a new blog post.
// PUT /post/:id: To update an existing blog post.
// DELETE /post/:id: To delete a blog post.
route.get('/', controller.createPost)
route.get('/:postId', controller.getViewPost);
route.get('/:postId/edit', authController.isAuthenticated, controller.getEditPost);
// like widget
route.post('/:postId/like', async (req, res) => {
  const itemId = req.params.postId;
//   const userId = req.user.id; // Assuming user authentication and req.user is populated
//   try {
//     // Check if the user has already liked/disliked this item
//     const existingLike = await db.query('SELECT * FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
//     let newLikeCount;
//     if (existingLike.length > 0) {
//       // User already liked, so unlike it (or toggle dislike)
//       await db.query('DELETE FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
//       newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
//     } else {
//       // User has not liked, so add a like
//       await db.query('INSERT INTO likes (item_id, user_id, value) VALUES (?, ?, 1)', [itemId, userId]);
//       newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
//     }
//     res.json({ message: 'Like status updated', newLikeCount: newLikeCount[0].count });
//   } catch (error) {
//     console.error('Database error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
});

export default route;
