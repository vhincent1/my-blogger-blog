import appConfig from '../app.config.js'
import { Mutex } from 'async-mutex';
import { readJsonFile, writeJsonFile } from './json.database.js';

const dbMutex = new Mutex();

class Database {
  config; //type,file,host
  blogPosts;
  // users;
  // comments;
  constructor(config) {
    this.config = config;
  }

  async load() {
    const release = await dbMutex.acquire()
    try {
      if (this.config.type == 'json')
        this.blogPosts = await readJsonFile(this.config.file);
    } catch (error) {
      console.log('Database error: ', error)
    } finally {
      release();
    }
  }

  async getAllBlogPosts() {
    return this.blogPosts;
  }

  async createPost(post) {
    const release = await dbMutex.acquire()
    try {
      this.blogPosts.push(post)
    } catch (error) {
      console.log('Database error: ', error)
    } finally {
      release();
    }
  }

  async savePosts() {
    const release = await dbMutex.acquire()
    try {
      await writeJsonFile(appConfig.database.file, this.blogPosts, (err) => {
        if (err) console.log('Error saving posts')
      })
    } catch (error) {
      console.log('Database error: ', error)
    } finally {
      release();
    }
  }

  // // Filter posts by the target tag
  // const targetTag = "art";
  // const taggedPosts = blogPosts.filter((post) => post.labels.includes(targetTag));
  // // console.log(taggedPosts.length);

  // // Sort posts by date (most recent first)
  // const newestPost = blogPosts.sort(
  //   (a, b) => new Date(b.published) - new Date(a.published)
  // );

  // async sortedPost() {
  //   const ascendingOrder = this.blogPosts.sort((a, b) => a.id - b.id);
  //   const descendingOrder = this.blogPosts.sort((a, b) => b.id - a.id);
  // }
}

const database = new Database(appConfig.database);
await database.load();

// console.log( database.getSizeTable(521));
// console.log('Post: ', (await database.getBlogPostById(521)).size);

export default database;
