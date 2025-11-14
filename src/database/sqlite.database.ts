import SQLite3 from 'better-sqlite3';
import fs from 'fs';
import { PostStatus, Post } from '../model/Post.model.ts';
import { PostsTable, type Posts } from '../model/Tables.model.ts';
import User from '../model/User.model.ts';

class SQLiteDatabase {
  db;
  constructor(config) {
    this.db = new SQLite3(config.sqlite3);
    this.db.pragma('journal_mode = WAL');
  }

  setup() {
    try {
      const sqlScript = fs.readFileSync('./public/schema/schema.sqlite.sql', 'utf8');
      this.db.exec(sqlScript);
      console.log('Schema created');
      this.db.close();
    } catch (error) {
      console.log('Failed to initialize database:', error);
      process.exit(1);
    }
  }

  closeDatabase() {
    if (this.db && !this.db.open) {
      // Check if db exists and is already closed (db.open is false after close)
      console.log('Database already closed.');
      return;
    }
    if (this.db) {
      try {
        this.db.close();
        console.log('Database connection closed gracefully.');
      } catch (err) {
        console.error('Error closing database:', err);
      }
    }
  }

  importPosts(posts: Post[]) {
    let checkTable = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get('posts');
    if (!checkTable) {
      console.error("posts table doesn't exist, use setup()");
      return;
    }

    const columns = Object.keys(PostsTable).join(', ');
    // prettier-ignore
    const placeholders = Object.keys(PostsTable).map((col) => `:${col}`).join(', ');
    const query = `INSERT OR REPLACE INTO posts (${columns}) VALUES (${placeholders});`;
    const insertStmt = this.db.prepare(query);

    // Execute the statement with values
    // Create a function to run the insertion within a transaction
    const insertPosts = this.db.transaction((postsData) => {
      for (const post of postsData) {
        const values: Posts = {
          id: post.id,
          user_id: 1,
          title: post.title,
          content: post.content,
          labels: post.labels.toString(),
          created_at: new Date(post.date.published).toISOString(),
          updated_at: new Date(post.date.updated).toISOString(),
          source: post.source?.url,
          status: PostStatus.PUBLISHED,
        };
        insertStmt.run(values);
      }
      const result = this.db.prepare('SELECT count(*) AS count FROM posts');
      console.log('Successfully inserted', result.get().count, 'posts rows');
    });

    checkTable = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get('media');
    if (!checkTable) {
      console.error("media table doesn't exist, use setup()");
      return;
    }

    // media
    const insertMediaStmt = this.db.prepare('INSERT OR REPLACE INTO media (id, user_id, images) VALUES (:id, :user_id, :images)');
    const insertMedia = this.db.transaction((postsData) => {
      for (const post of postsData)
        if (post.media?.images) {
          const values = { id: post.id, user_id: 1, images: JSON.stringify(post.media?.images) };
          insertMediaStmt.run(values);
        }

      const result = this.db.prepare('SELECT count(*) AS count FROM media');
      console.log('Successfully inserted', result.get().count, 'media rows');
    });

    try {
      insertPosts(posts);
      insertMedia(posts);
    } catch (err) {
      console.error('Error inserting posts:', err);
    }
  }

  savePost(post: Post) {
    console.log('Saving: ', post.title);
    const values: Posts = {
      id: post.id,
      user_id: 1,
      title: post.title,
      content: post.content,
      labels: post.labels.toString(),
      created_at: new Date(post.date.published).toISOString(),
      updated_at: new Date(post.date.updated).toISOString(),
      source: post.source?.url,
      status: PostStatus.PUBLISHED,
    };
    const columns = Object.keys(values).join(', ');
    // prettier-ignore
    const placeholders = Object.keys(values).map((key) => `:${key}`).join(', ');
    const insertStatement = this.db.prepare(`INSERT OR REPLACE INTO posts (${columns}) VALUES (${placeholders})`);
    const info = insertStatement.run(values);
    // console.log('Number of rows changed:', info.changes, '@ Row:', info.lastInsertRowid);

    //TODO: media
    return info;
  }

  async deletePost() {}

  postStatus(post: Post, status: PostStatus) {
    const update = this.db.prepare('UPDATE posts SET status = ? WHERE id = ?');
    return update.run(status, post.id);
  }

  #mapMedia(post_id: number) {
    const statement = this.db.prepare('SELECT images FROM media WHERE id = ?');
    const result = statement.get(post_id);
    if (result) return JSON.parse(result.images);
  }

  #mapRowToPost(row) {
    if (!row) return null;
    const post = new Post(row.id);
    post.title = row.title;
    post.content = row.content;
    post.labels = row.labels.split(',');
    post.date = {
      published: new Date(row.created_at),
      updated: new Date(row.updated_at),
    };

    const user: User | null = this.findUserById(row.user_id);
    // if (user) 
    post.author = 'VHINCENT'

    post.status = row.status;
    post.source = row.source;

    const images = this.#mapMedia(row.id);
    if (images) post.media = { images: images };

    return post;
  }

  #mapRowToUser(row) {
    if (!row) return null;
    const user = new User(row.id, row.username);
    user.password = row.password_hash;
    user.email = row.email;
    user.date = {
      registered: new Date(row.registration_date),
    };
    user.role = row.role;
    return user;
  }

  findPostById(id: number) {
    const statement = this.db.prepare('SELECT * FROM posts WHERE id = ?');
    const row = statement.get(id);
    return this.#mapRowToPost(row);
  }

  findAllPosts() {
    const statement = this.db.prepare('SELECT * FROM posts');
    const rows = statement.all();
    return rows.map((row) => this.#mapRowToPost(row));
  }

  findUserById(id: number) {
    const statement = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = statement.get(id);
    return this.#mapRowToUser(row);
  }

  findAllUsers() {
    const statement = this.db.prepare('SELECT * FROM users');
    const rows = statement.all();
    return rows.map((row) => this.#mapRowToUser(row));
  }
}

import appConfig from '../app.config.ts';
const database = new SQLiteDatabase(appConfig.database);
export default database;
