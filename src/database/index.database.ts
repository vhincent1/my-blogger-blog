import appConfig from '../app.config.ts';
import SQLiteDatabase from './sqlite.database.ts';
import JSONDatabase from './json.database.ts';

class Database {
  config; //type,file,host
  blogPosts;
  // users;
  // comments;
  constructor(config) {
    this.config = config;
  }

  async load() {
    if (this.config.type == 'json') {
      // this.blogPosts = await readJsonFile(this.config.file);
      await JSONDatabase.load()
      this.blogPosts = await JSONDatabase.getAllBlogPosts()
    } else if (this.config.type == 'sqlite') {
      this.blogPosts = SQLiteDatabase.findAllPosts().reverse();
    }
  }

  //select
  async getAllBlogPosts() {
    return this.blogPosts;
  }

  //insert
  async createPost(post) {}

  //update
  async savePosts() {}

  //delete
  async delete() {}
}

const database = new Database(appConfig.database);
await database.load();

// console.log( database.getSizeTable(521));
// console.log('Post: ', (await database.getBlogPostById(521)).size);

export default database;
