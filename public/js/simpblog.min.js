// Client-side lib
class SimpBlog {
  key;
  host;
  #config;

  // meta;

  constructor(key, host) {
    this.key = key;
    this.host = host || `http://${window.location.host}` || 'http://localhost:3000'; // 'http://'+window.location.host
    this.#config = {
      archiveContext: '/api/v1/archive',
      authContext: '/api/v1/auth',
      healthContext: '/api/v1/health',
      heartContext: '/api/v1/heart',
      labelsContext: '/api/v1/labels',
      pingContext: '/api/v1/ping',
      postsContext: '/api/v1/posts',
    };
  }

  #getContext = async (
    context,
    parameters = {
      page: null,
      limit: null,
      filter: null,
      exclude: null,
      search: null,
      type: null,
    },
    reqParams
  ) => {
    const url = new URL(context, this.host);

    if (parameters != undefined) {
      if (parameters.filter) parameters.filter = parameters.filter.split(',');
      if (parameters.exclude) parameters.exclude = parameters.exclude.split(',');
      for (const [key, value] of Object.entries(parameters)) {
        if (value == null) continue;
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url, { referrer: 'simpblog.lib.ts', ...reqParams });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  };

  checkHealth = async () => this.#getContext(this.#config.healthContext);
  getAllPosts = async (params = { page: 1, maxResultsPerPage: 5 }, callback) => {
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
  };
  getArchive = async () => this.#getContext(this.#config.archiveContext);
  getLabels = async (parameters) => this.#getContext(this.#config.labelsContext, parameters);
  getPosts = async (parameters) => this.#getContext(this.#config.postsContext, parameters);
  sendPing = async (misc) =>
    this.#getContext(this.#config.pingContext, null, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(misc),
    });

  //finds the page number of the post
  findPage = async (postId, maxResultsPerPage = 5) => {
    let result = {};
    await getAllPosts(1, maxResultsPerPage, (response) => {
      const found = response.data.find((post) => post.id == postId);
      if (found) result = { postId: found.id, page: response.currentPage };
    });
    return result;
  };

  heartPost = async (postId) => {
    // The browser automatically includes session cookies with the request if using session auth
    const serviceResponse = this.#getContext(`${this.#config.heartContext}/${postId}`, null, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // If using JWTs, you would add an Authorization header here:
        // 'Authorization': `Bearer ${yourAccessToken}`˝
      },
      body: JSON.stringify({ postId }),
    });

    console.log('resp:');
    console.log(await serviceResponse);

    // const data = await response.json();
    // try {
    //   if (response.ok) {
    //     // Handle successful like (e.g., update the button text, increment count)
    //     console.log('Liked successfully!');
    //   } else if (response.status === 401) {
    //     // Handle unauthorized access (e.g., show login prompt)
    //     alert('Please log in to like this post.');
    //   } else {
    //     // Handle other errors
    //     console.error('Failed to like post.');
    //   }
    // } catch (error) {
    //   console.error('Network error:', error);
    // }
  };

  authenticate = async (username, password) => {
    const encodedB64pw = btoa(password); //btob - decode
    const serviceResponse = this.#getContext(this.#config.authContext, null, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password: encodedB64pw }),
      // If using JWTs, you would add an Authorization header here:
      // 'Authorization': `Bearer ${yourAccessToken}`˝
      // headers: {
      //     'Authorization': `Bearer ${apiToken}`,
      //     'Content-Type': 'application/json' // Include Content-Type if sending a body
      // },
    });

    console.log('service:', await serviceResponse);
    return await serviceResponse;
    // localStorage.setItem('token', '');
    // localStorage.getItem('currentUser', '');
  };

  authenticateInfo = () => {
    console.log('e');
    localStorage.getItem('currentUser', '');
    // You can now access this on subsequent page loads using:
    // let storedUser = JSON.parse(localStorage.getItem('currentUser'))
  };

  // unused
  fetchAllPages = async (url, accumulatedItems = []) => {
    const response = await fetch(url);
    const data = await response.json();

    const currentItems = accumulatedItems.concat(data.data);
    if (data.nextPageToken) {
      const nextUrl = `${this.host}/api/v1/posts/?limit=1&page=${data.nextPageToken}`;
      return fetchAllPages(nextUrl, currentItems);
    } else return currentItems;
  };
}
