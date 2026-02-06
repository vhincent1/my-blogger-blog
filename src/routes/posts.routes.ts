import express from 'express';
const route = express.Router();

import authController from '../controller/auth.controller.ts';
import controller from '../controller/posts.controller.ts';

// GET /post: To retrieve all blog posts.
// GET /post/:id: To retrieve a specific blog post by its ID.
// POST /post: To create a new blog post.
// PUT /post/:id: To update an existing blog post.
// DELETE /post/:id: To delete a blog post.
route.get('/', controller.createPost);
route.get('/:postId', controller.getViewPost);
route.get('/:postId/edit', authController.isAuthenticated, controller.getEditPost);
// route.post('/:postId/heart', authController.isAuthenticated, (req, res) => {
//     console.log('heart')
// //   const postId = req.params.id;
//   // In a real app, you would also verify the user is logged in
//   // and hasn't liked the post already.

//   // TODO: Update the likes count in your database (MongoDB, MySQL, etc.)
//   // Example with a placeholder database function:
//   // const updatedPost = await database.incrementLikes(postId, req.user.id);
// //   const newLikesCount = 10; // Placeholder value

// //   res.status(200).json({ message: 'Like successful', newLikesCount: newLikesCount });
// });
// route.post('/post')

export default route;
