import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';
import fetch from 'node-fetch';
import parser from 'node-html-parser';

import appConfig from '../app.config.js'
import PostModel from '../model/Post.model.js';
const parameters = appConfig.blogger

// ------------------------- Blogger api ---------------------------
const blogger = google.blogger({
  version: 'v3',
  auth: parameters.apiKey,
});

async function getBloggerPosts(pageToken = null) {
  const params = {
    blogId: parameters.blogId,
    // Optional: maxResults, startDate, endDate, etc.
    // maxResults: 10,
    // labels: 'selfie',
    // endDate: new Date(2024-9-1)
    // fetchImages: false
  };
  if (pageToken) params.pageToken = pageToken;
  try {
    const res = await blogger.posts.list(params);
    return res.data; // This will contain 'items' (posts) and 'nextPageToken'
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Example usage for fetching all pages
async function fetchAllBloggerPosts() {
  let allPosts = [];
  let currentPageToken = null;
  do {
    const pageData = await getBloggerPosts(currentPageToken);
    if (pageData.items) allPosts = allPosts.concat(pageData.items);
    currentPageToken = pageData.nextPageToken;
  } while (currentPageToken);
  console.log('All posts fetched:', allPosts.length);
  return allPosts;
}
// -----------------------------------------------------------

async function downloadImage(imageUrl, savePath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(savePath, buffer);
  } catch (error) {
    return error;
    // console.error('Error downloading the image with fetch:', error);
    // throw error;
  }
}

/*
 * config = {
 * uploadPath: './public/content/',
 * hostPath:   'http://127.0.0.1:3000/images/'
 * }
 */
async function convertBloggerPosts(exportedData, extractConfig) {
  const bloggerData = exportedData.reverse();
  const convertedPosts = [];
  for (let index = 0; index < bloggerData.length; index++) {
    const bloggerPost = bloggerData[index];

    //insert post id
    // bloggerPost.index = index;

    // fix empty titles
    if (bloggerPost.title.length == 0) bloggerPost.title = 'untitled';

    // clear div styles
    const document = parser.parse(bloggerPost.content);
    document.querySelectorAll('div').forEach((element) => {
      element.removeAttribute('style');
    });

    // set new iframe
    document.querySelectorAll('iframe').forEach((frame) => {
      frame.setAttribute('height', 666);
      frame.setAttribute('width', '100%');
    });

    // update content
    bloggerPost.content = document.toString();

    // grab/update image files
    const imageFiles = [];
    const imgElement = document.querySelectorAll('img');
    if (imgElement.length > 0) {
      imgElement.forEach(async (img) => {
        const originalSource = img.getAttribute('src');
        const filename = path.basename(new URL(originalSource).pathname);
        imageFiles.push(filename);

        if (extractConfig) {
          // update image sources
          const hostURL = extractConfig.hostPath + bloggerPost.author.displayName;
          img.setAttribute('src', encodeURI(hostURL + '/' + filename));

          // update new image urls
          bloggerPost.content = document.toString();

          // configure paths
          const folderPath = extractConfig.uploadPath + bloggerPost.author.displayName;
          const savePath = path.resolve(folderPath, filename);
          await fs.mkdir(folderPath, { recursive: true });

          // if (bloggerPost.index == 522) {
          //   const ifExists = await checkFileExistence(savePath)
          //   if (!ifExists) {
          //     const error = await downloadImage(originalSource, savePath);
          //     if (error) {
          //       console.log('error ' + error)
          //     }
          //   }
          // }

          // download images
          const ifExists = await checkFileExistence(savePath)
          if (!ifExists) {
            const error = await downloadImage(originalSource, savePath);
            if (error) await fs.appendFile(extractConfig.errorLog, JSON.stringify({
              postId: index,
              author: bloggerPost.author.displayName,
              imageSource: originalSource,
              error: error.toString()
            }, null, 2))
          }
        }
      });
    }

    // new template
    const post = new PostModel(index);
    post.author = bloggerPost.author.displayName;
    post.title = bloggerPost.title;
    post.content = bloggerPost.content;
    post.labels = bloggerPost.labels;
    post.date = {
      published: bloggerPost.published,
      updated: bloggerPost.updated,
    };
    if (imageFiles.length > 0) post.media = { images: imageFiles, };
    post.source = { url: bloggerPost.url, };
    convertedPosts.push(post);
  }
  return convertedPosts;
}

async function checkFileExistence(folderPath) {
  try {
    await fs.access(folderPath, fs.constants.F_OK); // F_OK checks if the file/folder exists
    return true;
  } catch (error) {
    return false;
    // throw error;
  }
}

async function inspectPosts(jsonData, id) {
  console.log('Posts size: ', jsonData.length);
  let data = jsonData;
  if (id) data = data.filter((post) => post.id == id);
  const imagePosts = [];
  const uploadedVideos = [];
  const videoPosts = [];
  data.forEach((post) => {
    // if (post.index != 5) { // 2 cat pics
    //   return;
    // }
    // if (post.index != 496) {
    //   //has a video
    //   return;
    // }
    // const dom = new JSDOM(post.content);
    // const document = dom.window.document;
    const document = parser.parse(post.content);

    // posts that has an Image
    const imageTags = document.querySelectorAll('img');
    if (imageTags.length > 0) {
      //   console.log(`Post ${post.index} has ${imageTags.length}`);

      const imageUrls = [];
      imageTags.forEach(async (img) => {
        const imgSrc = img.getAttribute('src');
        imageUrls.push(imgSrc);
        const filename = path.basename(new URL(imgSrc).pathname);
      });

      const template = {
        postId: post.index,
        imageCount: imageTags.length,
        images: imageUrls,
        hasCorrectAmount: imageTags.length == imageUrls.length,
      };
      imagePosts.push(template);
    }

    // posts that has an uploaded video
    if (post.content.includes('BLOG_video_class')) {
      videoPosts.push(post);
      if (post.content.includes('youtube.com')) return;
      uploadedVideos.push(post);
      // console.log(post.url);
    }

    // posts with replies
    // const replies = parseInt(post.replies.totalItems);
    // if (replies >= 1) {
    //   console.log(post.title);
    // }

    // posts that has a youtube video
    // const youtubeVideos = extractYoutubeVideoIds(post.content);
    // if (youtubeVideos.length > 0) {
    //   youtubePosts.push({
    //     postId: post.index,
    //     videos: youtubeVideos,
    //   });
    // }
  });

  console.log('Total Media Posts: ' + imagePosts.length);
  console.log('Total Video Posts: ' + videoPosts.length);
  // needs to be downloaded manually
  console.log('Total Uploaded Media Posts : ' + uploadedVideos.length);

  let manualDownloadInfo = []
  uploadedVideos.forEach(post => {
    manualDownloadInfo.push({ postId: post.id, author: post.author, sourceUrl: post.source })
  });
  await fs.writeFile(parameters.exportConfig.inspectLog, JSON.stringify(manualDownloadInfo, null, 1))

  // misc
  let unique = [];
  videoPosts.forEach((v) => {
    // console.log(v.title)
    //exclude uploaded videos
    if (!uploadedVideos.includes(v)) {
      unique.push(v);
    }
  });

  //incorrect amount
  imagePosts.forEach((p) => {
    if (!p.hasCorrectAmount) console.log(p);
  });
}

// run
const exportFile = parameters.exported
const convertedFile = parameters.new
const command = process.argv[2];
switch (command) {
  case 'convert':
    if (await checkFileExistence(exportFile)) {
      let data = await fs.readFile(exportFile, 'utf8');
      const convertedData = await convertBloggerPosts(JSON.parse(data), parameters.exportConfig);
      data = JSON.stringify(convertedData.reverse(), null, 2);
      await fs.writeFile(convertedFile, data, 'utf8');
      console.log('Saved to: ', convertedFile);
    } else {
      console.log('no data found');
    }
    break;
  case 'export':
    console.log('Fetching from Blogger...');
    const data = await fetchAllBloggerPosts();
    console.log('Total posts: ' + data.length);

    // await writeJsonFile(parameters.exported, data);
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(exportFile, jsonString, 'utf8');

    console.log('Saved to ' + exportFile);
    break;
  case 'inspect':
    const inspectFile = parameters.new
    if (await checkFileExistence(inspectFile)) {
      const data = await fs.readFile(inspectFile, 'utf8');
      const postId = process.argv[3];
      inspectPosts(JSON.parse(data), postId);
    }
    break;
  default:
    console.log('Run arguments: (export | convert | inspect)');
    console.log('export -> downloads blogger data')
    console.log('convert -> converts exported data')
    console.log('inspect <post_id> -> post information')
    break;
}

// const url = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents10.jpg';
// const folderPath = './public/dist/export/' + 1;
// const filename = path.basename(new URL(url).pathname);

// const savePath = path.resolve(folderPath, filename);
// if (checkFileExistence(folderPath)) {
//   await fs.mkdir(folderPath, { recursive: true });
// }
// await downloadImageWithFetch(url, savePath);

// const p = './public/dist/export/519/AVvXsEjyqrsSeni9-Ky9ewM6sYPXAf7ZkpXfIF6z7-pNBlVPug7bzBpa3EqB7WoGRW7ZkscI2ledPSpXJD6UM-q5X1upzOPAUF_uC0a6Lpq7BCkn6KWzwzKBY08hfkFliXYPcAM0mbnOueJkaKOeZXEuTU38MuQh-zAN_c3iK9TlaVCw8mfwrbCVyPU7SWfnkyfw';
// console.log(path.extname(p).length == 0);

// const image = 'https://images.vestiairecollective.com/images/resized/w=1024,q=75,f=auto,/produit/blue-cotton-true-religion-jeans-43835798-1_2.jpg';
// await downloadImage(image, './public/f');
