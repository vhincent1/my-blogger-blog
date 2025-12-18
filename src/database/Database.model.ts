import type { Post } from '../model/Post.model.ts';
import SQLiteDatabase from './sqlite.database.ts';
import JSONDatabase from './json.database.ts';
import type Heart from '../model/Heart.model.ts';
import type { DatabaseI } from '../model/DatabaseI.model.ts';

export class Database implements DatabaseI {
  config; //type
  blogPosts: Post[];
  db: DatabaseI;

  constructor(config) {
    this.config = config;
  }
  findPostById(id: number): Post | null {
    throw new Error('Method not implemented.');
  }
  heartPost() {
    throw new Error('Method not implemented.');
  }

  async load() {
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
  getAllBlogPosts(): Post[] {
    // return this.blogPosts;
    return this.db.getAllBlogPosts();
  }

  getHearts(): Heart[] {
    return this.db.getHearts();
  }

  importPosts(posts: Post[]): void {
    this.db.importPosts(posts);
  }

  setup(dropExistingTables?): void {
    this.db.setup(dropExistingTables)
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