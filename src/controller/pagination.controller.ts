import type { PaginationParams, PaginatedResult, PaginatedQuery } from '../model/Pagination.model.ts';

export function getPaginationParameters(req, defaults): PaginationParams {
  let page, limit, search, type;
  if (req) {
    page = parseInt(req.query.page as string) || defaults.page;
    limit = parseInt(req.query.limit as string) || defaults.limit;
    search = req.query.search as string;
    type = req.query.type as string;
  } else {
    page = defaults.page;
    limit = defaults.limit;
    search = '';
    type = '';
  }
  const offset = (page - 1) * limit;
  return { page, limit, offset, search, type };
}

export async function getPaginatedData<T extends Array<any>>(parameters: PaginationParams, data: T): Promise<PaginatedResult<T>> {
  const { page, limit, offset, search, type } = parameters;
  const safePage = Math.max(0, page);
  const startIndex = safePage * limit;
  const endIndex = startIndex + limit;

  let items = data || [];
  // const paginatedResults = items.slice(startIndex, endIndex);

  const paginatedResults = items.slice(offset, offset + limit);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit); // -1; //todo cheapfix (last page is blank page)

  function generateNextPageToken() {
    if (page > totalPages) return null;
    return page < totalPages ? page + 1 : null;
  }

  return {
    parameters: parameters,
    data: paginatedResults,
    totalCount: items.length,
    totalPages,
    currentPage: page,
    limit,
    nextPageToken: generateNextPageToken(),
  };
}

export function getPaginatedQueryDetails(req, paginatedResult): PaginatedQuery {
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
    if (!currentUrl.includes('page=')) currentUrl += '&page=' + paginatedResult.currentPage;
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
  };
}
