import fetch from 'node-fetch';

const initialUrl = 'http://localhost:3000/api/v1/posts?limit=1';
const response = await fetch(initialUrl);
const data = await response.json();

if (data.error) {
  console.log('error', data);
} else {
  let allItems = data.data; // Assuming 'items' holds the data
  let nextPageToken = data.nextPageToken;
  while (nextPageToken) {
    const paginatedUrl = `http://localhost:3000/api/v1/posts?limit=1&page=${nextPageToken}`;
    const paginatedResponse = await fetch(paginatedUrl);
    const paginatedData = await paginatedResponse.json();

    allItems = allItems.concat(paginatedData.data);
    nextPageToken = paginatedData.nextPageToken; // Update for the next iteration

      console.log('data length: ', allItems.length);
  console.log('next page token: ', nextPageToken);
  }
}
async function fetchAllPages(url, accumulatedItems = []) {
  const response = await fetch(url);
  const data = await response.json();

  const currentItems = accumulatedItems.concat(data.items);
  if (data.nextPageToken) {
    const nextUrl = `https://api.example.com/data?maxResults=50&pageToken=${data.nextPageToken}`;
    return fetchAllPages(nextUrl, currentItems);
  } else {
    return currentItems;
  }
}

// const allItems2 = await fetchAllPages(initialUrl);
