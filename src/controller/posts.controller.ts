import PostService from '../services/post.service.ts'

import { navbarController } from './navbar.controller.ts';
import { pageController } from './page.controller.ts';

async function publishPost(req, res, editting) {
  let parameters = { editting: false }
  if (editting) {
    const postId = parseInt(req.params.postId);
    parameters = { editting: true, post: await PostService.getPostById(postId) }
  }
  res.render('publish-post', parameters);
}

const postsController = {
  createPost: async (req, res) => publishPost(req, res),
  getEditPost: async (req, res) => publishPost(req, res, true),
  getViewPost: async (req, res) => {
    const postId = parseInt(req.params.postId);
    res.render('view-post', {
      post: await PostService.getPostById(postId),
    });
  },
};

export default postsController;
