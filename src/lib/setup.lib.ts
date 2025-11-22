// import PostService from '../services/post.service.ts';
// import { Post } from '../model/Post.model.ts';

//TODO databases
import sqliteDb from '../database/sqlite.database.ts';

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

import appConfig from '../app.config.ts';
import { downloadImage, checkFileExistence, fetchAllBloggerPosts, convertBloggerPosts } from './blogger.lib.js';
import fs from 'fs/promises';

// exportBlog();

const exportBlogger = new Promise(async (resolve, reject) => {
  // Simulate an asynchronous operation
  // setTimeout(async () => {

  const file = appConfig.blogger.exported;
  if (await checkFileExistence(file)) {
    console.log('Using exported data');
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
      const result = convertBloggerPosts(bloggerPosts, appConfig.blogger.exportConfig);
      return result;
    },
    (error) => {
      console.error('Failure:', error);
      throw new Error('Further error processing');
    }
  )
  // download pictures
  .then(async (processedResult: any) => {
    console.log('Downloading', processedResult.imagesToDownload.length, 'images');
    const promises = processedResult.imagesToDownload.map(async (o) => {
      if (!(await checkFileExistence(o.path))) {
        const error = await downloadImage(o.source, o.path);
        if (appConfig.blogger.exportConfig.errorLog) {
          const errorInfo = {
            postId: o.index,
            author: o.author,
            imageSource: o.source,
            error: error.toString(),
          };
          if (error) {
            await fs.appendFile(appConfig.blogger.exportConfig.errorLog, JSON.stringify(errorInfo, null, 2));
            console.log('Error downloading image:', error);
          }
        }
      }
      return 0;
    });
    await Promise.all(promises); // Wait for all promises to resolve
    console.log('--- Done ---');
    return processedResult;
  })
  // import to database
  .then(async (processedResult: any) => {
    const result = await processedResult;
    if (result.convertedPosts) {
      console.log('Import to sqlite3 db');
      sqliteDb.importPosts(result.convertedPosts);
    } else if (result.errors) {
      console.log('Errors:',result.errors)
    }
    console.log('Done');
  })
  .catch((finalError) => {
    console.error('Caught a final error:', finalError);
  });
