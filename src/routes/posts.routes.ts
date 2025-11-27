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
// route.post('/post')

export default route;
