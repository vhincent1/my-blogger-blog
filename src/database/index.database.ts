import appConfig from '../app.config.ts';
import { Post } from '../model/Post.model.ts';
import SQLiteDatabase from './sqlite.database.ts';
import JSONDatabase from './json.database.ts';



class Database implements DatabaseI {
  config; //type
  blogPosts;
  db: DatabaseI;

  constructor(config) {
    this.config = config;
  }

  async load() {
    if (this.config.type == 'json') {
      // this.blogPosts = await readJsonFile(this.config.file);
      // await JSONDatabase.load();
      this.db = JSONDatabase
      // JSONDatabase.load()
      // await this.db.load()
      // this.blogPosts =  JSONDatabase.getAllBlogPosts();
    } else if (this.config.type == 'sqlite') {
      this.db = SQLiteDatabase;
      // this.blogPosts = this.db.getAllBlogPosts().reverse();
      // this.blogPosts = SQLiteDatabase.getAllBlogPosts()
    }

    await this.db.load()
    this.blogPosts = this.db.getAllBlogPosts()
  }

  //select
   getAllBlogPosts() {
    // return this.blogPosts;
    return this.db.getAllBlogPosts()
  }

  //insert
  // async createPost(post) {}

  //update
  // async savePosts() {}

  //delete
  // async delete() {}

  //shutdown
  close() {
    console.log('Closing database')
    this.db.close();
  }
}

enum Type { 
  CREATE,
  SAVE,
  EDIT
}

export interface DatabaseI {
  load(): void;
  getAllBlogPosts(): Post[];

  // createPost(post): void
  // savePost(post): void

  close(): void;
}

const database = new Database(appConfig.database);
await database.load();

// console.log( database.getSizeTable(521));
// console.log('Post: ', (await database.getBlogPostById(521)).size);

export default database;
