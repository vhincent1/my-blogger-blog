import express from 'express';

import authController from '../controller/auth.controller.js';
import { postsController } from '../controller/posts.controller.js';


const route = express.Router();

// GET /posts: To retrieve all blog posts.
// GET /posts/:id: To retrieve a specific blog post by its ID.
// POST /posts: To create a new blog post.
// PUT /posts/:id: To update an existing blog post.
// DELETE /posts/:id: To delete a blog post.

route.get('/:postId/edit', /*authController.isAuthenticated,*/ postsController.getEditPost);
route.get('/:postId', postsController.getViewPost);

export default route;
