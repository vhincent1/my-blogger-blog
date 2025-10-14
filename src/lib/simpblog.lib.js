class SimpBlog {
  key;
  host;
  #config;

  constructor(key, host) {
    this.key = key;
    this.host = host || 'http://localhost:3000';
    this.#config = {
      healthContext: '/api/v1/health',
      postsContext: '/api/v1/posts',
      pingContext: '/api/v1/ping',
      archiveContext: '/api/v1/archive',
      labelsContext: '/api/v1/labels',
    };
  }

  async #getContext(
    context,
    parameters = {
      page: null,
      limit: null,
      filter: null,
      exclude: null,
      search: null,
      type: null,
    }, reqParams) {

    const url = new URL(context, this.host);

    if (parameters != undefined) {
      if (parameters.filter) parameters.filter = parameters.filter.split(',');
      if (parameters.exclude) parameters.exclude = parameters.exclude.split(',');
      for (const [key, value] of Object.entries(parameters)) {
        if (value == null) continue;
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url, reqParams);
    if (!response.ok) throw new Error('Network response was not ok');
    const serviceResponse = await response.json();
    return serviceResponse;
  }

  getLabels = async (parameters) => this.#getContext(this.#config.labelsContext, parameters);
  checkHealth = async () => this.#getContext(this.#config.healthContext);
  getArchive = async () => this.#getContext(this.#config.archiveContext);
  sendPing = async (misc) => this.#getContext(this.#config.pingContext, null, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(misc),
  });

  getPosts = async (parameters) => this.#getContext(this.#config.postsContext, parameters);

  async getAllPosts(params = { page: 1, maxResultsPerPage: 5 }, callback) {
    let serviceResponse = await getPosts({ page: params.page, limit: params.maxResultsPerPage });
    if (serviceResponse.success == false) return [];
    const response = serviceResponse.responseObject;

    let allItems = response.data;
    let nextPageToken = response.nextPageToken;
    while (nextPageToken != null) {
      serviceResponse = await getPosts({ page: nextPageToken, limit: params.maxResultsPerPage });
      allItems = allItems.concat(serviceResponse.responseObject.data);
      nextPageToken = serviceResponse.responseObject.nextPageToken; // update for the next iteration
      if (callback) callback(serviceResponse);
    }
    return allItems;
  }

  async findPage(postId, maxResultsPerPage = 5) {
    let result = {};
    await getAllPosts(1, maxResultsPerPage, (response) => {
      const found = response.data.find((post) => post.id == postId);
      if (found) result = { postId: found.id, page: response.currentPage };
    });
    return result;
  }

  async fetchAllPages(url, accumulatedItems = []) {
    const response = await fetch(url);
    const data = await response.json();

    const currentItems = accumulatedItems.concat(data.data);
    if (data.nextPageToken) {
      const nextUrl = `http://localhost:3000/api/v1/posts/?limit=1&page=${data.nextPageToken}`;
      return fetchAllPages(nextUrl, currentItems);
    } else return currentItems;
  }
}