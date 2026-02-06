// deno-lint-ignore-file no-async-promise-executor
import fs from 'node:fs/promises';
import path from 'node:path';
import appConfig from '../src/app.config.ts';
import database from '../src/database/index.database.ts';
import { writeJsonFile } from '../src/database/json.database.ts';
import type { Post } from '../src/model/Post.model.ts';
import { checkFileExistence, fetchAllBloggerPosts, convertBloggerPosts } from '../src/lib/blogger.lib.js';
import { buildEntries, downloadEntries, type PostEntry, type SavePathCallback } from './download-images.ts';

interface BloggerLibResults {
  convertedPosts: Post[];
  errors?: any;
}

const exportBlogger = new Promise(async (resolve, reject) => {
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
    console.log('Downloading images...');

    /**
     *  Customize
     */
    const saveFolder: SavePathCallback = (entry: PostEntry) => {
      const post = entry.post;
      // console.log('saveFolder', post);
      // const imagePath = new URL(entry.source).pathname;
      const imagePath = entry.source;
      const fileName = decodeURIComponent(path.basename(imagePath));
      // the callback path to save the pics
      return `${appConfig.blogger.exportConfig.uploadPath}/${post.user_id}/${post.id}/${fileName}`;
    };

    console.log(processedResult.convertedPosts.length);

    const entries = await buildEntries(processedResult.convertedPosts);
    await Promise.resolve(downloadEntries(entries, saveFolder));

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

      database.setup({ dropExistingTables: true });

      // import
      database.importPosts(result.convertedPosts);
      // JSONDatabase.writ
      await writeJsonFile(appConfig.database.file, result.convertedPosts);
    } else if (result.errors) {
      console.log('Errors:', result.errors);
    }
    console.log('Done');
  })
  .catch((finalError) => {
    console.error('Caught a final error:', finalError);
  });
