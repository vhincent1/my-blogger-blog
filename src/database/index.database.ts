import appConfig from '../app.config.ts';
import { Post } from '../model/Post.model.ts';
import SQLiteDatabase from './sqlite.database.ts';
import JSONDatabase from './json.database.ts';

class Database implements DatabaseI {
  config; //type
  blogPosts: Post[];
  db: DatabaseI;

  constructor(config) {
    this.config = config;
  }

  async load() {
    console.log('loading');
    if (this.config.type == 'json') {
      this.db = JSONDatabase;
      await JSONDatabase.load();
    } else if (this.config.type == 'sqlite') {
      this.db = SQLiteDatabase;
    }

    this.db.load();
    // this.blogPosts = this.db.getAllBlogPosts()
  }

  //select
  getAllBlogPosts() {
    // return this.blogPosts;
    return this.db.getAllBlogPosts();
  }

  importPosts(posts: Post[]): void {
    this.db.importPosts(posts);
  }
  setup(): void {
    // throw new Error('Method not implemented.');
  }

  //insert
  // async createPost(post) {}

  //update
  // async savePosts() {}

  //delete
  // async delete() {}

  //shutdown
  close() {
    console.log('Closing database');
    this.db.close();
  }
}

enum Type {
  CREATE,
  SAVE,
  EDIT,
}

export interface DatabaseI {
  load(): void;
  getAllBlogPosts(): Post[];

  // createPost(post): void
  // savePost(post): void

  setup(): void;
  importPosts(posts: Post[]): void;
  close(): void;
}

const database = new Database(appConfig.database);
await database.load();

// console.log( database.getSizeTable(521));
// console.log('Post: ', (await database.getBlogPostById(521)).size);

export default database;
