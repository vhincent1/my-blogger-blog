import PostService from '../services/post.service.js';

//defaults = {page, limit, type(gallery, null)}
const handlePagination = async (req, defaults) => {
  const page = parseInt(req.query.page) || defaults.page;
  const limit = parseInt(req.query.limit) || defaults.limit;
  // search query
  const query = req.query.search;
  const type = req.query.type;
  const parameters = {
    query: query,
    type: type,
    page: page,
    limit: limit,
  };
  //---------------------- pagination ----------------------
  const safePage = Math.max(0, parameters.page);
  const startIndex = safePage * parameters.limit;
  const endIndex = startIndex + parameters.limit;

  let items
  if (defaults.type == 'gallery') {
    items = await PostService.getGallery(parameters);
  } else {
    items = await PostService.getPosts(parameters);
  }

  const paginatedResults = items.slice(startIndex, endIndex);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / parameters.limit) - 1; //todo cheapfix (last page is blank page)
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
  };
};

const pageController = {
  pagination: handlePagination,

  //show
  getFrontPage: async (req, res) => {
    const pagination = await handlePagination(req, { page: 0, limit: 5 });
    if (pagination.currentPage > pagination.totalPages) {
      res.status(404).render('404', { pagination: pagination });
    } else {
      res.render('index', { pagination: pagination, viewIndex: false });
    }
  },

  //list
  getIndex: async (req, res) => {
    const pagination = await handlePagination(req, { page: 0, limit: 100 });
    if (pagination.currentPage > pagination.totalPages) {
      res.status(404).render('404', { pagination: pagination });
    } else {
      res.render('index', { pagination: pagination, viewIndex: true });
    }
  },
};

export { pageController };

// src/controllers/UserController.js
class HomeController {
  list(req, res) {
    res.send('List of users');
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
