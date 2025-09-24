// import fetch from 'node-fetch';

const apiHost = 'http://localhost:3000'
const apiUrl = '/api/v1/posts'

async function getPosts(page, limit) {
  const initialUrl = apiHost + apiUrl + `?page=${page}&limit=${limit}`
  const include = '&include=id,title'
  const response = await fetch(initialUrl + include);
  const data = await response.json();
  //todo exclude content
  return data
}

// console.log(await getPosts(1, 1))

async function getAllPosts(startPage = 1, maxResultsPerPage = 5, callback) {
  const response = await getPosts(startPage, maxResultsPerPage)
  let allItems = response.data
  let nextPageToken = response.nextPageToken
  while (nextPageToken != null) {
    const paginatedData = await getPosts(nextPageToken, maxResultsPerPage)
    allItems = allItems.concat(paginatedData.data)
    nextPageToken = paginatedData.nextPageToken // update for the next iteration
    if (callback) callback(paginatedData)
  }
  return allItems
}

async function findPage(postId, maxResultsPerPage = 5) {
  let result = {}
  await getAllPosts(maxResultsPerPage, (response) => {
    const found = response.data.find(post => post.id == postId)
    if (found) result = { postId: found.id, page: response.currentPage }
  })
  return result
}
console.log(await findPage(397))

async function data() {
  const initialUrl = 'http://localhost:3000/api/v1/posts?limit=1';
  const response = await fetch(initialUrl);
  const data = await response.json();

  if (data.error) {
    console.log('error', data);
  } else {
    let allItems = data.data; // Assuming 'items' holds the data
    let nextPageToken = data.nextPageToken;
    while (nextPageToken != null) {
      const paginatedUrl = `http://localhost:3000/api/v1/posts?limit=1&page=${nextPageToken}`;
      const paginatedResponse = await fetch(paginatedUrl);
      const paginatedData = await paginatedResponse.json();

      allItems = allItems.concat(paginatedData.data);
      nextPageToken = paginatedData.nextPageToken; // Update for the next iteration

      console.log('data length: ', allItems.length);
      console.log('next page token: ', nextPageToken);
    }
  }
}

async function fetchAllPages(url, accumulatedItems = []) {
  const response = await fetch(url);
  const data = await response.json();
  console.log(data)

  const currentItems = accumulatedItems.concat(data.data);
  if (data.nextPageToken) {
    const nextUrl = `http://localhost:3000/api/v1/posts/?limit=1&page=${data.nextPageToken}`;
    return fetchAllPages(nextUrl, currentItems);
  } else {
    return currentItems;
  }
}
// await fetchAllPages('http://localhost:3000/api/v1/posts?limit=1')

console.log()


// let allItems = result.data

// async function findPage(postId, pageLimit) {
//   let result
//   let nextPageToken = 0
//   while (nextPageToken != null) {
//     // const paginatedUrl = `http://localhost:3000/api/v1/posts?limit=1&page=${nextPageToken}`;
//     // const paginatedResponse = await fetch(paginatedUrl);
//     async function getData(page, limit) {
//       const getPaginationParams = getPaginationParameters(null, { page: page, limit: limit })
//       const result = await getPaginatedData(getPaginationParams, posts)
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

// await findPage(397, 5)