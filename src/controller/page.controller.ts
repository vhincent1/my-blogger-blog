import PostService from '../services/post.service.ts';

interface Pagination {
  page: number;
  limit: number;
  data?: any;
  query?: string;
  type?: string;
}

//defaults = {page, limit, type(gallery, null)}
const handlePagination = async (req, parameters: Pagination) => {
  // const page = parseInt(req.query.page) || defaults.page;
  // const limit = parseInt(req.query.limit) || defaults.limit;
  // // search query
  // const query = req.query.search;
  // const type = req.query.type;
  // const parameters = {
  //   query: query,
  //   type: type,
  //   page: page,
  //   limit: limit,
  // };
  //---------------------- pagination ----------------------
  const safePage = Math.max(0, parameters.page);
  const startIndex = safePage * parameters.limit;
  const endIndex = startIndex + parameters.limit;

  // console.log(parameters);

  let items = parameters.data || [];
  // if (defaults.type == 'gallery') {
  //   items = await PostService.getGallery(parameters);
  // } else {
  //   items = await PostService.getPosts(parameters);
  // }

  const paginatedResults = items.slice(startIndex, endIndex);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / parameters.limit)// -1; //todo cheapfix (last page is blank page)
  //---------------------- pagination ----------------------

  // console.log("Current page query: " + req.query.page);
  // console.log("Current Page: " + search.page);

  //------- pagination urls
  let currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  // if(parameters.page > totalPages){
  //   parameters.page = totalPages
  //   console.log("Current page: "+parameters.page)
  //   console.log("Total: "+totalPages)
  // }

  const pageQuery = 'page=' + parameters.page;

  let nextPage = parameters.page + 1;
  if (nextPage > totalPages) nextPage = totalPages;
  const nextQuery = 'page=' + nextPage;

  let prevPage = parameters.page - 1;
  if (prevPage < 0) prevPage = 0;
  const prevQuery = 'page=' + prevPage;

  // appened query
  const queries = Object.keys(req.query);
  if (queries.length == 0) {
    currentUrl += '?page=' + parameters.page;
  } else {
    // currentURL += "&page=" + page;
    if (!currentUrl.includes('page=')) currentUrl += '&page=' + parameters.page;
  }

  // fix starting page
  if (currentUrl.includes('page=0')) {
    // currentURL = currentURL.replace("page=0", "page=1");
  }

  // appened page query to the current url
  //  if (!currentURL.includes("page=")) currentURL += "&page=" + page;

  const nextPageURL = currentUrl.replace(pageQuery, nextQuery);
  const previousPageURL = currentUrl.replace(pageQuery, prevQuery);

  // console.log("Current: " + currentPageQuery);
  // console.log("Next: " + nextPageURL);
  //--------

  // if (parameters.page > totalPages) {
  //   return res.status(404).send('not found')
  // }

  function generateNextPageToken() {
    const currentPage = parameters.page
    if (parameters.page < totalPages) //hasNextPage
      return currentPage + 1
     else return null
  }

  return {
    //pagination
    posts: paginatedResults,
    currentPage: parameters.page,
    totalPages: totalPages,
    limit: parameters.limit,
    // pages prev,next
    hasPrevPage: parameters.page > 0,
    hasNextPage: parameters.page < totalPages,
    nextPageURL: nextPageURL,
    previousPageURL: previousPageURL,
    // original URL
    originalURL: req.originalUrl, //form
    nextPageToken: generateNextPageToken()
  };
};

// src/controllers/UserController.js
class PageController {
  async list(req, res, viewingIndex, limit) {
    // search query
    const parameters: Pagination = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || limit,
      query: req.query.search,
      type: req.query.type,
    };

    const serviceResponse = await PostService.getPosts(parameters);
    const posts = serviceResponse.responseObject;
    parameters.data = posts;
    // console.log('RESPONSE: ', serviceResponse);
    const pagination = await handlePagination(req, parameters);
    if (pagination.currentPage > pagination.totalPages) {
      res.status(404).render('404', { errorMessage: 'Not found' });
    } else {
      res.status(serviceResponse.statusCode).render('index', { pagination: pagination, viewIndex: viewingIndex });
    }

  }
  create(req, res) {
    res.send('Create a new user');
  }
  show(req, res) {
    res.send(`Showing user with ID: ${req.params.id}`);
  }
  update(req, res) {
    res.send(`Updating user with ID: ${req.params.id}`);
  }
  destroy(req, res) {
    res.send(`Deleting user with ID: ${req.params.id}`);
  }
}

const c = new PageController();

const pageController = {
  pagination: handlePagination,
  //show
  getFrontPage: async (req, res) => {
    c.list(req, res, false, 5);
  },
  //list
  getIndex: async (req, res) => {
    c.list(req, res, true, 100);
  },
};

export { pageController, type Pagination };
