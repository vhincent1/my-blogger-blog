import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { google } from 'googleapis';
import fetch from 'node-fetch';
import parser from 'node-html-parser';

import appConfig from '../app.config.ts';
import PostModel from '../model/Post.model.ts';
const parameters = appConfig.blogger;

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

async function downloadImage(imageUrl, savePath, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++)
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(savePath, buffer);
    } catch (error) {
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
      } else {
        console.error(`Failed to download image after ${retries} attempts.`);
        // throw error; // Re-throw if all retries fail
        return error;
      }
      // console.error('Error downloading the image with fetch:', error);
      // throw error;
    }
}

async function downloadImage2(imageUrl, destPath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    async function getImageHash(buffer, algorithm = 'md5') {
      try {
        // const fileBuffer = await fs.readFile(imagePath); // Asynchronously read the image file
        const fileBuffer = buffer;
        const hash = crypto.createHash(algorithm);
        hash.update(fileBuffer);
        return hash.digest('hex');
      } catch (error) {
        console.error(`Error generating hash for ${imagePath}:`, error);
        throw error;
      }
    }

    const hash = await getImageHash(buffer);
    const savePath = path.resolve(destPath, hash);

    // dup
    if (await checkFileExistence(savePath)) {
      // const __dirname = path.resolve()
      // const fileExtension = path.extname(fileName) || '';
      // const fileNameWithoutExt = fileName.replace(fileExtension, '')
      // // const hash = await getImageHash(savePath)
      // // console.log('hash: ', hash)
      // const oldFilePath = path.join(__dirname, 'public', fileName);
      // //const newFileName = fileNameWithoutExt + '_' + hash + fileExtension
      // const newFileName = hash
      // const newFilePath = path.join(__dirname, 'public', newFileName);
      // fs.rename(oldFilePath, newFilePath, (err) => {
      //   if (err) {
      //     console.error('Error renaming file:', err);
      //     return;
      //   }
      //   console.log('File renamed successfully!');
      // })
      // result = { hash: hash, fileName: fileName }
    } else {
      await fs.writeFile(savePath, buffer);
    }
    const fileName = decodeURIComponent(path.basename(new URL(imageUrl).pathname));
    return { status: 'OK', hash, fileName, savePath };
  } catch (error) {
    return { status: 'ERROR', error };
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
async function convertBloggerPosts(exportedData, config) {
  const bloggerData = exportedData.reverse();
  const convertedPosts = [];
  const imageDatabase = [];
  const errors = [];
  let author;
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
        const imagePath = new URL(originalSource).pathname;
        const baseFileName = path.basename(imagePath);
        const filename = decodeURIComponent(baseFileName);
        // imageFiles.push({ path: imagePath.replace(baseFileName, ''), filename });

        imageFiles.push(filename);

        if (config) {
          if (!config.enabled) return;
          // update image sources
          const hostURL = config.storageDir(config.hostPath, bloggerPost, index);
          img.setAttribute('src', encodeURI(hostURL + '/' + filename));
          // update new image urls
          bloggerPost.content = document.toString();

          // configure paths
          const storagePath = config.storageDir(config.uploadPath, bloggerPost, index);
          await fs.mkdir(storagePath, { recursive: true });
          // if (bloggerPost.index == 522) {
          //   const ifExists = await checkFileExistence(savePath)
          //   if (!ifExists) {
          //     const error = await downloadImage(originalSource, savePath);
          //     if (error) {
          //       console.log('error ' + error)
          //     }
          //   }
          // }
          const savePath = path.resolve(storagePath, filename);

          // const response = await downloadImage2(originalSource, folderPath)
          // if (response.status == 'OK') {
          //   const imageFile = response.result.hash

          //   const hostURL = extractConfig.hostPath + bloggerPost.author.displayName;
          //   img.setAttribute('src', encodeURI(hostURL + '/' + imageFile));

          //   console.log(img.getAttribute('src'))
          //   // update new image urls
          //   bloggerPost.content = document.toString();
          //   // console.log(imageFile)

          //   // imageDatabase.push(result)
          // }

          // download images
          if (!(await checkFileExistence(savePath))) {
            const error = await downloadImage(originalSource, savePath);
            if (config.errorLog) {
              if (error)
                await fs.appendFile(
                  config.errorLog,
                  JSON.stringify(
                    {
                      postId: index,
                      author: bloggerPost.author.displayName,
                      imageSource: originalSource,
                      error: error.toString(),
                    },
                    null,
                    2
                  )
                );

              if (error) {
                console.log('ERROR');
                console.log('error ' + error);
                // errors.push(1)
              }
            }
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
    post.date = { published: bloggerPost.published, updated: bloggerPost.updated };
    if (imageFiles.length > 0) post.media = { images: imageFiles };
    post.source = { url: bloggerPost.url };
    convertedPosts.push(post);

    author = post.author;
  }
  // return {
  //   convertedPosts: convertedPosts.reverse(),
  //   imageDatabase: imageDatabase,
  //   author: author
  // };
  return { convertedPosts, errors };
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
    const document = parser.parse(post.content);

    // posts that has an Image
    const imageTags = document.querySelectorAll('img');
    if (imageTags.length > 0) {
      //   console.log(`Post ${post.index} has ${imageTags.length}`);

      const imageUrls = [];
      imageTags.forEach(async (img) => {
        const imgSrc = img.getAttribute('src');
        imageUrls.push(imgSrc);

        console.log(imgSrc)

        try {
          const filename = path.basename(new URL(imgSrc).pathname);
        } catch (err) {
          console.log('error');
        }
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
    console.log(post.content)
  });

  console.log('Total Media Posts: ' + imagePosts.length);
  console.log('Total Video Posts: ' + videoPosts.length);
  // needs to be downloaded manually
  console.log('Total Uploaded Media Posts : ' + uploadedVideos.length);

  const exportInspect = parameters.exportConfig.inspectLog;
  if (exportInspect) {
    let manualDownloadInfo = [];
    uploadedVideos.forEach((post) => {
      manualDownloadInfo.push({ postId: post.id, author: post.author, sourceUrl: post.source });
    });
    //todo toggle
    console.log(exportInspect);
    await fs.writeFile(exportInspect, JSON.stringify(manualDownloadInfo, null, 1));
  }
  // misc
  let unique = [];
  videoPosts.forEach((v) => {
    // console.log(v.title)
    //exclude uploaded videos
    if (!uploadedVideos.includes(v)) unique.push(v);
  });

  //incorrect amount
  imagePosts.forEach((p) => {
    if (!p.hasCorrectAmount) console.log(p);
  });
}

// run
const exportFile = parameters.exported;
const convertedFile = parameters.new;
const command = process.argv[2];
switch (command) {
  case 'convert':
    if (await checkFileExistence(exportFile)) {
      let data = await fs.readFile(exportFile, 'utf8');
      const result = await convertBloggerPosts(JSON.parse(data), parameters.exportConfig);

      const convertedData = result.convertedPosts;
      data = JSON.stringify(convertedData.reverse(), null, 2);

      await fs.writeFile(convertedFile, data, 'utf8');
      console.log('Saved to: ', convertedFile);
      console.log('errors: ' + Object.keys(result.errors));

      // image database
      // console.log('author: ' + result.author)
      // await fs.writeFile('./public/db.json', JSON.stringify(result.imageDatabase, null, 2), 'utf8');
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
    const inspectFile = parameters.new;
    if (await checkFileExistence(inspectFile)) {
      const data = await fs.readFile(inspectFile, 'utf8');
      const postId = process.argv[3];
      inspectPosts(JSON.parse(data), postId);
    }
    break;
  default:
    console.log('Run arguments: (export | convert | inspect)');
    console.log('export -> downloads blogger data');
    console.log('convert -> converts exported data');
    console.log('inspect <post_id> -> post information');
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

// const image = 'https://www.google.com/logos/fnbx/ingenuity/heli_dark.gif'
// // const image = 'https://images.vestiairecollective.com/images/resized/w=1024,q=75,f=auto,/produit/blue-cotton-true-religion-jeans-43835798-1_2.jpg';
// const filename = decodeURIComponent(path.basename(new URL(image).pathname));
// const result = await downloadImage2(image, './public/', filename);
// // if (result.error) console.log(result.error)
// // if (result.hash) console.log('ok')
// console.log(result)
// imageDatabase.push(result)
// await fs.writeFile('./public/db.json', JSON.stringify(imageDatabase, null, 2))
