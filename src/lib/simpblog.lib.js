const simpblog = {
  apiHost: 'http://localhost:3000',
  healthContext: '/api/v1/health',
  postsContext: '/api/v1/posts',
  pingContext: '/api/v1/ping',
  key: '',
};

async function checkHealth() {
  try {
    const response = await fetch(simpblog.apiHost + simpblog.healthContext);
    const data = await response.json();
    // if (response.ok) {
    //   console.log('Application is healthy:', data);
    // } else {
    //   console.error('Application is unhealthy:', data);
    // }
    return data;
  } catch (error) {
    console.error('Error fetching health check: ');
  }
}

async function sendPing(misc) {
  try {
    const response = await fetch(simpblog.apiHost + simpblog.pingContext, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(misc),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err)
  }
}

async function getPosts(
  params = {
    page: 1,
    limit: 5,
    filter: null,
    exclude: null,
    search: null,
    type: null,
  }
) {
  if (params.filter) params.filter = params.filter.split(',');
  if (params.exclude) params.exclude = params.exclude.split(',');

  const url = new URL(simpblog.postsContext, simpblog.apiHost);
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network response was not ok');
  const serviceResponse = await response.json();
  // if (serviceResponse.success) {
  //     const responseObject = serviceResponse.responseObject
  //     return responseObject
  // }
  return serviceResponse;
}

// console.log(await getPosts())

// console.log(await getPosts({ page: 0, limit: 1, exclude: 'content' }))

async function getAllPosts(params = { startPage: 0, maxResultsPerPage: 5 }, callback) {
  const response = await getPosts({ page: params.startPage, limit: params.maxResultsPerPage });
  let allItems = response.data;
  let nextPageToken = response.nextPageToken;
  while (nextPageToken != null) {
    const paginatedData = await getPosts({ page: nextPageToken, limit: params.maxResultsPerPage });
    allItems = allItems.concat(paginatedData.data);
    nextPageToken = paginatedData.nextPageToken; // update for the next iteration
    if (callback) callback(paginatedData);
  }
  return allItems;
}
// let allItems = []
// function a(data){
//     allItems = allItems.concat(data.data)
//     // console.log(data.nextPageToken)
//     // exclude data
//     // const processedData = data.map(({ data, ...rest }) => rest);
//     // console.log(data)
// }
// const b = await getAllPosts({startPage: 0, maxResultsPerPage: 5}, a)
// console.log(b[0])

async function findPage(postId, maxResultsPerPage = 5) {
  let result = {};
  await getAllPosts(1, maxResultsPerPage, (response) => {
    const found = response.data.find((post) => post.id == postId);
    if (found) result = { postId: found.id, page: response.currentPage };
  });
  return result;
}

async function fetchAllPages(url, accumulatedItems = []) {
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);

  const currentItems = accumulatedItems.concat(data.data);
  if (data.nextPageToken) {
    const nextUrl = `http://localhost:3000/api/v1/posts/?limit=1&page=${data.nextPageToken}`;
    return fetchAllPages(nextUrl, currentItems);
  } else {
    return currentItems;
  }
}

async function displayPosts(
  params = {
    page,
    limit,
    search,
    type,
  }, style = 0 ) {
  console.log('current page: ', params.page);
  console.log('max results : ', params.limit);

  try {
    const response = await getPosts(params);
    if (!response.success) {
      //   hasMoreData = false; // server response
      return;
    }
    const posts = response.responseObject.data;

    isLoading = false;
    return response;
  } catch (error) {
    console.error('Error loading more items:', error);
    isLoading = false;
    // hasMoreData = false;
  }
}
