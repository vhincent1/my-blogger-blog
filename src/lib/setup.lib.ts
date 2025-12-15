import database from '../database/index.database.ts';
import {writeJsonFile} from '../database/json.database.ts';
// sqliteDb.setup()

// async function getPosts() {
//   const serviceResponse = await PostService.getPosts();
//   if (serviceResponse.success == false) {
//     console.error('Error: ', serviceResponse);
//     process.exit(0);
//   }
//   const posts: any = await serviceResponse.responseObject;
//   return posts;
// }

// const sqliteDb = new SQLiteDatabase();
// await sqliteDb.getAllBlogPosts()
// sqliteDb.setup()

// const posts = await getPosts();
// sqliteDb.importPosts(posts);

// const post = sqliteDb.findPostById(262)
// const user = sqliteDb.findUserById(1)
// console.log(user?.username)
// console.log(post)

// import { buildSizeTable } from '../utils/post.utils.ts';
// console.log(buildSizeTable(post))

// import fs from 'fs'

// const size = fs.statSync('/Users/vhincent/Programming/web/simpblog/public/content/262/6bd8b0b4-cdb9-429c-9150-02f5def338d5.jpg').size
// console.log(size)

// const post: Post = posts.filter((p) => p.id == 681)
// sqliteDb.savePost(post[0]);

// const db = new MySQLDatabase();
// await db.getAllBlogPosts();

// console.log('done');
// process.exit(0);

/**
 *
 */

import appConfig from '../app.config.ts';
import { downloadImage, checkFileExistence, fetchAllBloggerPosts, convertBloggerPosts } from './blogger.lib.js';
import fs from 'fs/promises';
import path from 'path';
import HTML_parser from 'node-html-parser';
// exportBlog();

// interfaces
import type { Post } from '../model/Post.model.ts';

interface DownloadImage {
  author: string; //post author
  index: number; //post id
  source: string; // img src
  path: string; //save path
}
interface BloggerLibResults {
  convertedPosts: Post[];
  imagesToDownload: DownloadImage[];
  errors: any
}

const exportBlogger = new Promise(async (resolve, reject) => {
  // Simulate an asynchronous operation
  // setTimeout(async () => {

  const file = appConfig.blogger.exported;
  if (await checkFileExistence(file)) {
    console.log('Using exported data:', file);
    const data = await fs.readFile(file, 'utf8');
    return resolve(JSON.parse(data));
  }

  console.log('Fetching all posts from Blogger API...');
  const bloggerPosts = await fetchAllBloggerPosts();
  const jsonString = JSON.stringify(bloggerPosts, null, 2);
  await fs.writeFile(file, jsonString, 'utf8');
  console.log('Saved to ' + file);
  // const success = true; // Change to false to simulate rejection
  // if (success) {
  //   resolve('Data successfully fetched!');
  // } else {
  //   reject('Error: Failed to fetch data.');
  // }
  return resolve(bloggerPosts);
  // }, 2000);
});

exportBlogger
  .then(
    (bloggerPosts: any) => {
      console.log('Posts fetched:', bloggerPosts.length);
      const result: BloggerLibResults = convertBloggerPosts(bloggerPosts, appConfig.blogger.exportConfig);
      return result;
    },
    (error) => {
      console.error('Failure:', error);
      throw new Error('Further error processing');
    }
  )
  /**
   * Download pictures
   */
  .then(async (processedResult: BloggerLibResults) => {
    const errorLogFile = appConfig.blogger.exportConfig.errorLog;
    console.log('Downloading', processedResult.imagesToDownload.length, 'Images');

    const saveFolder = (o) => `${appConfig.blogger.exportConfig.uploadPath}/${o.author}/${o.index}`;
    console.log('To: ', saveFolder({ author: 'AUTHOR', index: 'POST_ID' }));

    const downloadImages = async () => {
      const missingData: any = [];
      const result = processedResult.imagesToDownload.map(async (o) => {
        const imagePath = new URL(o.source).pathname;
        const fileName = decodeURIComponent(path.basename(imagePath));

        // const saveFolder = `${appConfig.blogger.exportConfig.uploadPath}/${o.author}/${o.index}`;
        const savePath = path.resolve(saveFolder({ author: o.author, index: o.index }), fileName);

        // ---------------------
        await fs.mkdir(path.dirname(savePath), { recursive: true });
        const ifImageExists = await checkFileExistence(savePath);
        if (!ifImageExists) {
          console.log('Downloading image, post:', o.index)
          const error = await downloadImage(o.source, savePath);
          if (errorLogFile && error) {
            const errorInfo = {
              postId: o.index,
              author: o.author,
              imageSource: o.source,
              downloadPath: savePath, //path.dirname(o.path),
              error: await error.toString(),
            };
            missingData.push(await errorInfo);
            console.log('Error downloading image:', await error.message);
          }
        } else {
          // console.log('already downloaded')
        }
      });
      await Promise.all(result); // wait for all downloads to resolve
      await fs.writeFile(errorLogFile, JSON.stringify(missingData, null, 2)); // write to log
    };
    await Promise.resolve(downloadImages());

    //configure new image sources
    // const editImageSources = () => {
    //   const posts: Post[] = processedResult.convertedPosts;
    //   const imagesToDownload: ImagesToDownload[] = processedResult.imagesToDownload;
    //   console.log(imagesToDownload.length);

    //   interface ImagesToDownload {
    //     author: string;
    //     index: number; // post id
    //     source: string; //http url
    //     path: string; //save path
    //   }

    //   for (const post of posts) {
    //     const document = HTML_parser.parse(post.content);
    //     const imgElements = document.querySelectorAll('img');
    //     imgElements.forEach((img) => {
    //       const originalSource: any = img.getAttribute('src');

    //       let imagePath;
    //       try {
    //         const imgURL = new URL(originalSource);
    //         imagePath = imgURL.pathname;
    //       } catch (err) {
    //         imagePath = originalSource;
    //       }
    //       const baseFileName = path.basename(imagePath);
    //       const filename = decodeURIComponent(baseFileName);

    //       const cfg = appConfig.blogger.exportConfig;
    //       const newImgPath = `${cfg.hostPath}${post.author}/${post.id}/${filename}`;

    //       if (post.id == 683) {
    //         console.log('postID:', post.id, newImgPath);
    //         console.log(originalSource)
    //       }
    //       // img.setAttribute('src', encodeURI(newImgPath));
    //     });

    //     // const newImgSrc = cfg.storageDir(cfg.hostPath, post);
    //     // const data = imagesToDownload.filter((o) => {
    //     //   o.index == post.id;
    //     // });
    //   }
    // };
    // await Promise.resolve(editImageSources());

    console.log('--- Done ---');
    return processedResult;
  })
  /**
   * Import to database
   */
  .then(async (processedResult: BloggerLibResults) => {
    const result = await processedResult;
    if (result.convertedPosts) {
      console.log('Importing to', appConfig.database.type);
      database.setup();
      database.importPosts(result.convertedPosts);

      // JSONDatabase.writ
      writeJsonFile('./public/dist/posts.json', result.convertedPosts);

    } else if (result.errors) {
      console.log('Errors:', result.errors);
    }
    console.log('Done');
  })
  .catch((finalError) => {
    console.error('Caught a final error:', finalError);
  });
