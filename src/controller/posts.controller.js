import database from '../database/index.database.js';

import { navbarController } from './navbar.controller.js';
import { pageController } from './page.controller.js';

const postsController = {
  getEditPost: async (req, res) => {
    const postId = parseInt(req.params.postId);
    res.render('publish', {
      post: await database.getBlogPostById(postId),
    });
  },
  getViewPost: async (req, res) => {
    const postId = parseInt(req.params.postId);
    res.render('view-post', {
      post: await database.getBlogPostById(postId),
    });
  },
};

export { postsController };
