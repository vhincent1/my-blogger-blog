import fetch from 'node-fetch';

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

  const currentItems = accumulatedItems.concat(data.items);
  if (data.nextPageToken) {
    const nextUrl = `https://api.example.com/data?maxResults=50&pageToken=${data.nextPageToken}`;
    return fetchAllPages(nextUrl, currentItems);
  } else {
    return currentItems;
  }
}

// const allItems2 = await fetchAllPages(initialUrl);

const originalArray = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' }
];

const exclude = [1, 2]

// Exclude the element where id is 2
const filteredArray = originalArray.filter(item => !exclude.includes(item.id));

console.log(filteredArray);
// Output: [ { id: 1, name: 'Apple' }, { id: 3, name: 'Cherry' } ]
