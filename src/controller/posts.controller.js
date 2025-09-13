import PostService from '../services/post.service.js'

import { navbarController } from './navbar.controller.js';
import { pageController } from './page.controller.js';

const postsController = {
  getEditPost: async (req, res) => {
    const postId = parseInt(req.params.postId);
    res.render('publish-post', {
      post: await PostService.getPostById(postId),
    });
  },
  getViewPost: async (req, res) => {
    const postId = parseInt(req.params.postId);
    res.render('view-post', {
      post: await PostService.getPostById(postId),
    });
  },
};

export { postsController };
