import appConfig from '../src/app.config.ts';
import fs from 'fs/promises';
import path from 'path';
import { checkFileExistence, downloadImage } from '../src/utils/io.utils.ts';

// blogspot/blogger utils
import { convertBloggerPosts } from '../src/lib/blogger.lib.js';
const errorLogFile = appConfig.blogger.exportConfig.errorLog;

interface DownloadEntry {
  post: Omit<Post, 'content' | 'labels'>;
  source: string; // img src
}
// callback function
type SaveFolderCallback = (entry: DownloadEntry) => string;

const downloadImages = async (entries: DownloadEntry[], saveFolder: SaveFolderCallback) => {
  // statistic counter
  let counts = {};
  const downloadStats: any[] = [];
  entries.forEach((entry: any) => (counts[entry.post.id] = (counts[entry.post.id] || 0) + 1));
  for (const [postId, total] of Object.entries(counts)) {
    downloadStats.push({ entryId: postId, total: total, images: [] });
  }
  entries.forEach((entry: any) => {
    const stat = downloadStats.find((stat) => stat.entryId == entry.post.id);
    stat.images.push(entry.source);
  });

  const downloadStat = (entryId) => downloadStats.find((stat) => stat.entryId == entryId);
  const removeImage = (entryId, source) => {
    const stat = downloadStat(entryId);
    const index = stat.images.indexOf(source);
    if (index > -1) stat.images.splice(index, 1);
  };
  const totalCount = (entryId) => downloadStat(entryId).total;
  const totalLeftover = (entryId) => downloadStat(entryId).images.length;
  // ----

  const missingData: any = [];
  const result = entries.map(async (entry) => {
    // const imagePath = new URL(entry.source).pathname;
    // const fileName = decodeURIComponent(path.basename(imagePath));

    // const saveFolder = `${appConfig.blogger.exportConfig.uploadPath}/${o.author}/${o.index}`;
    // const savePath = path.resolve(saveFolder({ author: o.post.author, index: o.post.id }), fileName);
    const savePath = path.resolve(saveFolder(entry));

    // ---------------------
    await fs.mkdir(path.dirname(savePath), { recursive: true });
    const ifImageExists = await checkFileExistence(savePath);
    if (!ifImageExists) {
      console.log('Downloading post:', entry.post.id, '...');

      function isValidUrl(urlString: string): boolean {
        try {
          new URL(urlString);
          return true;
        } catch (error) {
          return false;
        }
      }
      if(!isValidUrl(entry.source)){
        console.log('Malformed URL')
        return
      }

      const result: any = await Promise.resolve(downloadImage(entry.source, savePath));

      if (result) {
        const identifier: any = entry.post.id;
        console.log('Downloading post id:', entry.post.id, '(', totalLeftover(identifier), '/', totalCount(identifier), ') result:', result);
        if (result.success) {
          // update statistic
          removeImage(identifier, entry.source);
        } else {
          //log error
          const errorInfo = {
            postId: entry.post.id,
            author: entry.post.author,
            imageSource: entry.source,
            downloadPath: savePath,
            error: await result.error.toString(),
          };
          missingData.push(errorInfo);
          console.log('Error downloading image:', await result.error);
        }
      }
    } else {
      // console.log('image already downloaded')
    }
  });
  await Promise.all(result); // wait for all downloads to resolve
  await fs.writeFile(errorLogFile, JSON.stringify(missingData, null, 2)); // write to log
};

// const imagesToDownload: DownloadImage[] = []

// console.log('Downloading', imagesToDownload.length, 'Images');

import { postService } from '../src/services/index.service.ts';
import parser from 'node-html-parser';
import type { Post } from '../src/model/Post.model.ts';

const buildEntries = async (posts: Post[]): Promise<DownloadEntry[]> => {
  //   const serviceResponse = await postService.getPosts();
  //   const posts = await serviceResponse.responseObject;
  //   if (posts == null) return [];

  console.log('Downloading', posts.length);

  const entries: DownloadEntry[] = [];
  posts.forEach((post) => {
    const document = parser.parse(post.content);

    const imgElement = document.querySelectorAll('img');
    if (imgElement.length > 0) {
      imgElement.forEach(async (img) => {
        const originalSource: any = img.getAttribute('src');
        // const imagePath = new URL(originalSource).pathname;
        // const baseFileName = path.basename(imagePath);
        // const filename = decodeURIComponent(baseFileName);

        const originalObject = post;
        // Destructure the unwanted property and collect the rest in a new object
        const { content, labels, ...publicObject } = originalObject;
        // You can specify the type for the new object
        const typedPublicObject: Omit<typeof originalObject, 'content' | 'labels'> = publicObject;

        const data: DownloadEntry = {
          post: typedPublicObject,
          source: originalSource, // img src
          //   filename: filename
        };

        // if (isValidUrl(originalSource))
        entries.push(data);
      });
    }
  });

  return entries;
};

const run = async () => {
  /**
   *  Customize
   */
  const saveFolder: SaveFolderCallback = (entry: DownloadEntry) => {
    const post = entry.post;
    console.log('saveFolder', post)
    // const imagePath = new URL(entry.source).pathname;
    const imagePath = entry.source;
    const fileName = decodeURIComponent(path.basename(imagePath));
    // the callback path to save the pics
    return `${appConfig.blogger.exportConfig.uploadPath}/${post.user_id}/${entry.post.id}/${fileName}`;
  };

  // Blogger posts
  const data = await fs.readFile(appConfig.blogger.exported, 'utf8');
  const bloggerPosts: Post[] = convertBloggerPosts(JSON.parse(data));

  // PostService
  const serviceResponse = await postService.getPosts();
  const posts = await serviceResponse.responseObject;

  const entries = await buildEntries(posts!!);

  //download
  await Promise.resolve(downloadImages(entries, saveFolder));
};

run();

// download stat counter thingy test
//   download.forEach((entry) => {
//     // console.log(path.basename(entry.source));
//     const url = new URL(entry.source); //bloggerposts
//     console.log(url.protocol);
//   });

//   let counts = {};
//   const downloadStats: any[] = [];
//   download.forEach((entry: any) => (counts[entry.post.id] = (counts[entry.post.id] || 0) + 1));
//   for (const [postId, total] of Object.entries(counts)) {
//     downloadStats.push({ entryId: postId, total: total, images: [] });
//   }
//   download.forEach((entry: any) => {
//     const stat = downloadStats.find((stat) => stat.entryId == entry.post.id);
//     stat.images.push(entry.source);
//   });
//   const downloadStat = (entryId) => downloadStats.find((stat) => stat.entryId == entryId);
//   const removeImage = (entryId, source) => {
//     const stat = downloadStat(entryId);
//     const index = stat.images.indexOf(source);
//     if (index > -1) stat.images.splice(index, 1);
//   };
//   const totalCount = (entryId) => downloadStat(entryId).total;
//   const totalLeftover = (entryId) => downloadStat(entryId).images.length;
//   const rm = 'https://blogger.googleusercontent.com/img/a/AVvXsEgoHpaem34EyBEqIXM-uv22fqLaJRMaN7rq4ffr5AY3Npk4DORs1t8e9la0NsD0U_Wx-X2LrbwcTLGGHyEvnxfWiMVQCtbYnm8Jw32fsWQX_QXwVJDVrlWznmLjCUvCnihaWyCOVTDtvItVlS9EyQ9I8UewhrHcBFDkzlZvaX66jdAr8tsCgcbWCLsUGcAY';
//   removeImage(703, rm);
//   console.log(downloadStat(703));
//   console.log(totalLeftover(703),'/',totalCount(703));

//   const testId = 1000;
//   counts[testId] = 100;
//   //   console.log(counts);
//   const countdownInterval = setInterval(function () {
//     console.log(`post: ${testId} (${counts[testId]}/${counts[testId]})`);
//     counts[testId] = counts[testId] - 1;
//   }, 1000); // 1000ms = 1 second
