const simpblog = {
  apiHost: 'http://localhost:3000',
  postsUrl: '/api/v1/posts',
  key: '',
};

async function post(page, limit) {
  const initialUrl = simpblog.apiHost + simpblog.apiUrl + `?page=${page}&limit=${limit}`;
  const include = '&filter=id,title';
  const response = await fetch(simpblog.apiHost + simpblog.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page,
      limit,
      filter: ['id'],
    }),
  });
  const data = await response.json();
  //todo exclude content
  return data;
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

  const url = new URL(simpblog.postsUrl, simpblog.apiHost);
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


  async function displayPosts(params = {
    page,
    limit,
    search,
    type
  }, style = 0) {
    console.log('current page: ', params.page);
    console.log('max results : ', params.limit);

    try {
      const response = await getPosts(params);
      if (!response.success) {
        //   hasMoreData = false; // server response
        return
      }
      const posts = response.responseObject.data;

  
      isLoading = false;
      return response
    } catch (error) {
      console.error('Error loading more items:', error);
      isLoading = false;
      // hasMoreData = false;
    }
  }
