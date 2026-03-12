// import SQLite3 from 'better-sqlite3';
import { DatabaseSync } from "node:sqlite";

import fs from 'node:fs';

import appConfig from '../app.config.ts';
import type { DatabaseI } from '../model/DatabaseI.model.ts';
import { PostsTable } from './tables/posts.table.ts';
import { UsersTable } from './tables/users.table.ts';

import type { PostStatus, Post } from '../model/Post.model.ts';
import type Heart from '../model/Heart.model.ts';
import User from '../model/User.model.ts';
import { HeartsTable } from './tables/hearts.table.ts';

export class SQLiteDatabase implements DatabaseI {
  version = 2; //2 json
  #db;
  #postsTable: PostsTable;
  #usersTable: UsersTable;
  #heartsTable: HeartsTable;

  constructor(config) {
    this.#db = new DatabaseSync(config.sqlite3 /*{readonly: true}*/);
    // this.#db.pragma('journal_mode = WAL');

    // tables
    this.#usersTable = new UsersTable(this.#db);
    this.#postsTable = new PostsTable(this.#db, this.#usersTable);
    this.#heartsTable = new HeartsTable(this.#db);
  }

  load(): void {
    // throw new Error('Method not implemented.');
  }

  close(): void {
    if (this.#db && !this.#db.open) {
      // Check if db exists and is already closed (db.open is false after close)
      console.log('Database already closed.');
      return;
    }
    if (this.#db)
      try {
        this.#db.close();
        console.log('Database connection closed gracefully.');
      } catch (err) {
        console.error('Error closing database:', err);
      }
  }

  setup(config?: { dropExistingTables: false; print: false }) {
    try {
      if (this.version == 1) {
        const sqlScript = fs.readFileSync('./public/schema/schema.sqlite.sql', 'utf8');
        this.#db.exec(sqlScript);
      } else if (this.version == 2) {
        //setup tables
        // console.log(usersTable.generateSchema())
        try {
          // users
          this.#db.exec(this.#usersTable.generateSchema(config));
          const defaultUsers = [new User(1, 'host'), new User(2, 'Vhincent')];
          defaultUsers.forEach((user) => {
            const scheme = this.#usersTable.tableScheme(user);
            console.log(this.#usersTable.insertData(scheme, (user) => console.log(`Inserting id=${user.id} username=${user.username}`)));
          });
          this.#db.exec(this.#postsTable.generateSchema(config));
        } catch (error) {
          console.log(error);
        }
      }
      console.log('Schema created');
      // this.db.close();
    } catch (error) {
      console.log('Failed to initialize database:', error);
      // process.exit(1);
    }
  }

  importPosts(posts: Post[]) {
    console.log('importPosts()');
    this.#postsTable.importData(posts);
  }

  savePost(post: Post) {
    console.log('Saving: ', post.title);
    const values = this.#postsTable.tableScheme(post);
    this.#postsTable.insertData(values);
  }

  async deletePost() {}

  postStatus = (post: Post, status: PostStatus) => this.#postsTable.update(post, 'status', status);
  findPostById = (id: number): Post | null => this.#postsTable.findById(id);

  //   findAllPosts() {
  getAllBlogPosts(): Post[] {
    console.log('getAllBlogPosts()');
    return this.#postsTable.fetchAll();
  }

  findUserById = (id: number) => this.#usersTable.findById(id);
  findAllUsers = () => this.#usersTable.fetchAll();

  getHearts = (): Heart[] => this.#heartsTable.fetchAll();
  heartPost = (id, user_id, value?) => this.#heartsTable.heartPost(id, user_id, value);
}

const database = new SQLiteDatabase(appConfig.database);
export default database;
