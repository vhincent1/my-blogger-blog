import PostService from '../services/post.service.ts';

interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  nextPageToken: number | null;
}

interface PaginatedQuery {
  // pages prev,next
  hasPrevPage: boolean;
  hasNextPage: boolean;
  nextPageURL: string;
  previousPageURL: string;
  // original URL
  originalURL: string;
}

function getPaginationParameters(req, defaults): PaginationParams {
  let page, limit
  if (req) {
    page = parseInt(req.query.page as string) || defaults.page;
    limit = parseInt(req.query.limit as string) || defaults.limit;
  } else {
    page = defaults.page
    limit = defaults.limit
  }
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
async function getPaginatedData<T extends Array<any>>(params: PaginationParams, data: T): Promise<PaginatedResult<T>> {
  const { limit, offset, page } = params;
  const safePage = Math.max(0, page);
  const startIndex = safePage * limit;
  const endIndex = startIndex + limit;

  let items = data || [];
  // const paginatedResults = items.slice(startIndex, endIndex);

  const paginatedResults = items.slice(offset, offset + limit);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit)// -1; //todo cheapfix (last page is blank page)

  function generateNextPageToken() {
    if (page > totalPages) return null
    return page < totalPages ? page + 1 : null
  }

  return {
    data: paginatedResults,
    totalCount: items.length,
    totalPages,
    currentPage: page,
    limit,
    nextPageToken: generateNextPageToken()
  };
}

function getPaginatedQueryDetails(req, paginatedResult): PaginatedQuery {
  let currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const pageQuery = 'page=' + paginatedResult.currentPage;
  let nextPage = paginatedResult.currentPage + 1;
  if (nextPage > paginatedResult.totalPages) nextPage = paginatedResult.totalPages;
  const nextQuery = 'page=' + nextPage;
  let prevPage = paginatedResult.currentPage - 1;
  if (prevPage < 0) prevPage = 0;
  const prevQuery = 'page=' + prevPage;
  // appened query
  const queries = Object.keys(req.query);
  if (queries.length == 0) {
    currentUrl += '?page=' + paginatedResult.currentPage;
  } else {
    if (!currentUrl.includes('page='))
      currentUrl += '&page=' + paginatedResult.currentPage;
  }
  const nextPageURL = currentUrl.replace(pageQuery, nextQuery);
  const previousPageURL = currentUrl.replace(pageQuery, prevQuery);
  return {
    // pages prev,next
    hasPrevPage: paginatedResult.currentPage > 0,
    hasNextPage: paginatedResult.currentPage < paginatedResult.totalPages,
    nextPageURL: nextPageURL,
    previousPageURL: previousPageURL,
    // original URL
    originalURL: req.originalUrl, //form
  }
}

async function findPage(postId, pageLimit, data) {
  let result: any
  let nextPageToken: number | null = 0
  while (nextPageToken != null) {
    // const paginatedUrl = `http://localhost:3000/api/v1/posts?limit=1&page=${nextPageToken}`;
    // const paginatedResponse = await fetch(paginatedUrl);
    async function getData(page, limit) {
      const getPaginationParams = getPaginationParameters(null, { page: page, limit: limit })
      const result = await getPaginatedData(getPaginationParams, data)
      return result
    }
    const paginatedData = await getData(nextPageToken, pageLimit);
    // allItems = allItems.concat(paginatedData.data);
    const find = paginatedData.data.find(post => post.id == postId)
    if (find) {
      console.log('f', paginatedData.currentPage)
      result = { page: paginatedData.currentPage }
    }
    // r.push({page: paginatedData.currentPage, find})
    nextPageToken = paginatedData.nextPageToken; // Update for the next iteration
  }
  return result
}

// src/controllers/UserController.js
class PageController {
  async list(req, res, viewingIndex, limit) {
    // search query
    // const parameters: Pagination = {
    //   page: parseInt(req.query.page) || 0,
    //   limit: parseInt(req.query.limit) || limit,
    //   query: req.query.search,
    //   type: req.query.type,
    // };
    const parameters = getPaginationParameters(req, { page: 1, limit });
    const serviceResponse = await PostService.getPosts({
      search: req.query.search,
      type: req.query.type
    });
    if (serviceResponse.success) {
      const posts: any = serviceResponse.responseObject;
      const paginatedResult = await getPaginatedData(parameters, posts)
      const paginationQueryDetails = getPaginatedQueryDetails(req, paginatedResult)
      // parameters.data = posts;

      // console.log('RESPONSE: ', serviceResponse);
      // const pagination = await handlePagination(req, parameters);
      // console.log(pagination.totalPages)
      if (paginatedResult.currentPage > paginatedResult.totalPages) {
        res.status(404).render('404', { errorMessage: 'Not found' });
      } else {
        res.status(serviceResponse.statusCode).render('index', {
          pagination: paginationQueryDetails,
          paginationResult: paginatedResult,
          viewIndex: viewingIndex
        });
      }
    } else {
      res.status(serviceResponse.statusCode).send(serviceResponse)
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

const c = new PageController();

const pageController = {
  getFrontPage: async (req, res) => c.list(req, res, false, 5),
  getIndex: async (req, res) => c.list(req, res, true, 100)
};

export {
  pageController,
  getPaginationParameters,
  getPaginatedData,
  getPaginatedQueryDetails,
};
