import appConfig from '../app.config.ts';
import PostService from '../services/post.service.ts';

// import { navbarController } from './navbar.controller.ts';
// import { homepageController } from './home.controller.ts';

async function publishPost(req, res) {
  const postId = parseInt(req.params.postId);
  const serviceResponse = await PostService.getPostById(postId);
  // console.log(serviceResponse)

  const postFound = serviceResponse.success;
  console.log(postFound, postId);

  const parameters: any = {
    post: postFound ? serviceResponse.responseObject : null,
    editting: postFound,
  };

  // error message test
  const { error } = req.query;
  if (error) {
    parameters.error = { message: error };
  }

  res.render('v1/publish', parameters);
}

const postsController = {
  createPost: async (req, res) => publishPost(req, res),
  getEditPost: async (req, res) => publishPost(req, res),
  getViewPost: async (req, res) => {
    const postId = parseInt(req.params.postId);
    const serviceResponse = await PostService.getPostById(postId);
    if (!serviceResponse.success) return res.status(serviceResponse.statusCode).render('404', { errorMessage: 'Post not found' });

    res.status(serviceResponse.statusCode).render('view-post', {
      post: serviceResponse.responseObject,
      nextPost: postId + 1,
      prevPost: postId - 1,
      // findPage: findPage(postId, 5, 0)
    });
  },
};

export default postsController;
