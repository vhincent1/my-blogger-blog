import PostService from '../services/post.service.ts';
import { getPaginationParameters, getPaginatedQueryDetails, getPaginatedData } from './pagination.controller.ts';

// async function findPage(postId, pageLimit, data) {
//   let result: any
//   let nextPageToken: number | null = 0
//   while (nextPageToken != null) {
//     // const paginatedUrl = `http://localhost:3000/api/v1/posts?limit=1&page=${nextPageToken}`;
//     // const paginatedResponse = await fetch(paginatedUrl);
//     async function getData(page, limit) {
//       const getPaginationParams = getPaginationParameters(null, { page: page, limit: limit })
//       const result = await getPaginatedData(getPaginationParams, data)
//       return result
//     }
//     const paginatedData = await getData(nextPageToken, pageLimit);
//     // allItems = allItems.concat(paginatedData.data);
//     const find = paginatedData.data.find(post => post.id == postId)
//     if (find) {
//       console.log('f', paginatedData.currentPage)
//       result = { page: paginatedData.currentPage }
//     }
//     // r.push({page: paginatedData.currentPage, find})
//     nextPageToken = paginatedData.nextPageToken; // Update for the next iteration
//   }
//   return result
// }

// src/controllers/UserController.js
class HomeController {
  async list(req, res, viewingIndex, limit) {
    // search query
    // const parameters: Pagination = {
    //   page: parseInt(req.query.page) || 0,
    //   limit: parseInt(req.query.limit) || limit,
    //   query: req.query.search,
    //   type: req.query.type,
    // };
    const parameters: any = getPaginationParameters(req, { page: 1, limit });
    // console.log(parameters)
    parameters.meta = { source: 'home/controller/list' };
    const serviceResponse = await PostService.getPosts(parameters);
    // console.log('Service: ', serviceResponse)
    if (serviceResponse.success) {
      const posts: any = await serviceResponse.responseObject;
      const paginatedResult = await getPaginatedData(parameters, posts);
      const paginationQueryDetails = getPaginatedQueryDetails(req, paginatedResult);
      // parameters.data = posts;

      // console.log('RESPONSE: ', serviceResponse);
      // const pagination = await handlePagination(req, parameters);
      // console.log(pagination.totalPages)
      if (paginatedResult.currentPage > paginatedResult.totalPages) {
        res.status(404).render('404', { errorMessage: 'Not found' });
      } else {
        res.status(serviceResponse.statusCode).render('themes/v1/index', {
          pagination: paginationQueryDetails,
          paginationResult: paginatedResult,
          viewIndex: viewingIndex,
        });
      }
    } else {
      // console.log('internal error')
      res.status(serviceResponse.statusCode).send(serviceResponse);
    }
  }
  create(req, res) {
    res.send('Create a new user');
  }
  show(req, res) {
    // res.send(`Showing user with ID: ${req.params.id}`);
  }
  update(req, res) {
    res.send(`Updating user with ID: ${req.params.id}`);
  }
  destroy(req, res) {
    res.send(`Deleting user with ID: ${req.params.id}`);
  }
}

const c = new HomeController();

const homepageController = {
  getFrontPage: async (req, res) => c.list(req, res, false, 5),
  getIndex: async (req, res) => c.list(req, res, true, 100),
};

export { homepageController };
