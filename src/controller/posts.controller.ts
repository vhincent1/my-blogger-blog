import appConfig from '../app.config.ts'
import PostService from '../services/post.service.ts'

import { navbarController } from './navbar.controller.ts';
import { pageController } from './page.controller.ts';

async function publishPost(req, res, editting = false) {
  const postId = parseInt(req.params.postId);
  const serviceResponse = await PostService.getPostById(postId)
  const create = !serviceResponse.success 
  res.render('publish-post', { post: serviceResponse.responseObject, editting: editting});
}

const postsController = {
  createPost: async (req, res) => publishPost(req, res),
  getEditPost: async (req, res) => publishPost(req, res, true),
  getViewPost: async (req, res) => {
    const postId = parseInt(req.params.postId);
    const serviceResponse = await PostService.getPostById(postId)
    if (!serviceResponse.success)
      return res.status(serviceResponse.statusCode).render('404', { errorMessage: 'Post not found' })
    res.status(serviceResponse.statusCode).render('view-post', {
      post: serviceResponse.responseObject,
      nextPost: postId + 1,
      prevPost: postId - 1
    })
  },
};

export default postsController;