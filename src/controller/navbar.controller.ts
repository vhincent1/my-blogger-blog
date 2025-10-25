import {Post} from '../model/Post.model.ts';
import PostService from '../services/post.service.ts';

const sr = await PostService.getPosts()
const blogPosts: any = sr.responseObject;

// ----------- Label Menu -----------
function countTagOccurrences(tagsArray) {
  const tagCounts = {}; // Initialize an empty object to store tag counts
  for (const tag of tagsArray) {
    // For each tag in the input array
    tagCounts[tag] = (tagCounts[tag] || 0) + 1; // Increment its count, or initialize to 1 if first occurrence
  }
  return tagCounts; // Return the object containing tag counts
}

let allLabels = [];
blogPosts.forEach((post) => { allLabels = allLabels.concat(post.labels); });

const uniqueTags = [...new Set(allLabels)];
const labelCount = countTagOccurrences(allLabels.sort().reverse());
// Convert the object into an array of objects for easier consumption
const result = Object.keys(labelCount).map((label) => ({
  name: label,
  count: labelCount[label],
}));

function getSortedLabels() {
  return result;
}

// ----------- Grouped Posts -----------
const postCountByYear = blogPosts.reduce((acc, post) => {
  const year = new Date(post.date.published).getFullYear();
  acc[year] = (acc[year] || 0) + 1;
  return acc;
}, {});

function getYearlyCount(year) {
  return postCountByYear[year];
}


/*
 *
 *
 * postsByMonthYear["Month Year"] // "August 2025"
 * key = "MONTH YEAR"
 *
 *
 */
const postsByMonthYear = blogPosts.reduce((groups, post) => {
  const date = new Date(post.date.published);
  const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  if (!groups[monthYear]) groups[monthYear] = [];
  groups[monthYear].push({ postId: post.id, title: post.title });
  return groups;
}, {});

function getPostsByDate(month, year) {
  return postsByMonthYear[month + ' ' + year];
}

// console.log(postsByMonthYear)

// ----------- Archive Menu -----------
const archiveMenu = [];

// load
function buildMenu() {
  Object.keys(postCountByYear).reverse().forEach((year) => {
    // yearly
    const yearlyPostCount = postCountByYear[year];
    // console.log("--- " + year + " (" + yearlyPostCount + ") ----");
    let YTD = { year: year, total: yearlyPostCount };
    let MTD: any = [];
    //monthly
    // key = "Month Year"
    Object.keys(postsByMonthYear).filter((key) => key.includes(year))
      .reverse() // descending order
      .forEach((key) => {
        const posts = postsByMonthYear[key];
        const month = key.replace(' ' + year, '');
        const monthCount = posts.length;
        MTD.push({ month, total: monthCount });
        YTD.MTD = MTD;
      });
    //update
    archiveMenu.push(YTD);
  });
  return archiveMenu;
}

function getArchiveMenu() {
  return archiveMenu;
}
//----------------------

// console.log(collection.length);
// console.log(collection);

buildMenu();

//display
//   let index = 0;
// archiveMenu.forEach((YTD) => {
//   //   console.log(YTD);
//   console.log(YTD.year + " (" + YTD.total + ")");

//   // display each month

//   YTD.MTD.forEach((MTD) => {
//     index++
//     const posts = getPostsByDate(MTD.month, YTD.year);
//     console.log("- " + MTD.month + " (" + posts.length + ")");
//     // console.log(posts.length)
//     // console.log(posts);
//     console.log(index)
//     posts.slice(posts.length - 1).forEach((post) => {
//       //   console.log(post.title);
//     });
//   });
//   console.log('INDEX: '+index)
// });

// console.log(groupedMonthlyPosts)

// const controller = {
//   getArchiveMenu: (req, res) => {
//     const navbar = {};
//     res.render("partials/navbar", navbar);
//   },
// };

const navbarController = {
  getSortedLabels,
  getArchiveMenu,
  // getYearlyCount,
  getPostsByDate,
};

export { navbarController };
