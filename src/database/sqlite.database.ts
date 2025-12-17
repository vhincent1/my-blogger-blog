import SQLite3 from 'better-sqlite3';
import fs from 'fs';

import appConfig from '../app.config.ts';
import type { DatabaseI } from '../model/DatabaseI.model.ts';
import { PostsTable } from './tables/posts.table.ts';
import { UsersTable } from './tables/users.table.ts';

import { PostStatus, Post } from '../model/Post.model.ts';
import Heart from '../model/Heart.model.ts';
import User from '../model/User.model.ts';

export class SQLiteDatabase implements DatabaseI {
  version = 2; //2 json
  #db;

  #postsTable: PostsTable;
  #usersTable: UsersTable;

  constructor(config) {
    this.#db = new SQLite3(config.sqlite3);
    this.#db.pragma('journal_mode = WAL');

    // tables
    this.#usersTable = new UsersTable(this.#db);
    this.#postsTable = new PostsTable(this.#db, this.#usersTable);
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

  setup() {
    try {
      const sqlScript = fs.readFileSync('./public/schema/schema.sqlite.sql', 'utf8');
      this.#db.exec(sqlScript);
      console.log('Schema created');
      // this.db.close();
    } catch (error) {
      console.log('Failed to initialize database:', error);
      // process.exit(1);
    }
  }

  importPosts(posts: Post[]) {
    this.#postsTable.importData(posts);
  }

  savePost(post: Post) {
    console.log('Saving: ', post.title);
    const values = this.#postsTable.tableScheme(post);
    this.#postsTable.insertData(values);
  }

  async deletePost() {}

  postStatus(post: Post, status: PostStatus) {
    if (this.version === 2) {
      const update = this.#db.prepare('UPDATE posts SET data = json_replace(data, "$.status", ?) WHERE id = ?');
      return update.run(status, post.id);
    }
    const update = this.#db.prepare('UPDATE posts SET status = ? WHERE id = ?');
    return update.run(status, post.id);
  }

  // #mapMedia(post_id: number) {
  //   const statement = this.db.prepare('SELECT images FROM media WHERE id = ?');
  //   const result = statement.get(post_id);
  //   if (result) return JSON.parse(result.images);
  // }

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
    post.category = row.category;

    const user: User | null = this.findUserById(row.user_id);
    if (user) post.author = user.username;
    post.user_id = row.user_id
    // post.author = 'VHINCENT'

    post.status = row.status;
    post.source = row.source;

    // const images = this.#mapMedia(row.id);
    // if (images) post.media = { images: images };

    return post;
  }

  #mapRowToUser(row) {
    if (!row) return null;
    const user = new User(row.id, row.username);
    user.password = row.password_hash;
    user.email = row.email;
    // user.date = {
    //   registered: new Date(row.registration_date),
    // };
    user.registration_date = row.registration_date;
    user.role = row.role;
    return user;
  }

  #mapHeartToPost(row) {
    if (!row) return null;
    const heart = new Heart(row.post_id, row.user_id, row.value);
    return heart;
  }

  findPostById(id: number): Post | null {
    // const statement = this.#db.prepare('SELECT * FROM posts WHERE id = ?');
    // const row = statement.get(id);
    // const data = this.version === 2 ? JSON.parse(row.data) : row;
    // return this.#mapRowToPost(data);
    const post = this.#postsTable.findById(id);
    return post;
  }

  //   findAllPosts() {
  getAllBlogPosts(): Post[] {
    console.log('getAllBlogPosts()');
    const statement = this.#db.prepare('SELECT * FROM posts ORDER BY id DESC'); //ASC - recent, DESC - oldest
    const rows = statement.all();
    return rows.map((row) => this.#mapRowToPost(this.version === 2 ? JSON.parse(row.data) : row));
  }

  findUserById(id: number) {
    const statement = this.#db.prepare('SELECT * FROM users WHERE id = ?');
    const row = statement.get(id);
    return this.#mapRowToUser(row);
  }

  findAllUsers() {
    const statement = this.#db.prepare('SELECT * FROM users');
    const rows = statement.all();
    return rows.map((row) => this.#mapRowToUser(row));
  }

  getHearts(): Heart[] {
    const statement = this.#db.prepare('SELECT * FROM hearts');
    const rows = statement.all();
    return rows.map((row) => this.#mapHeartToPost(row));
  }

  heartPost(id, user_id, value) {
    //     const existingLike = await db.query('SELECT * FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
    //     let newLikeCount;
    //     if (existingLike.length > 0) {
    //       // User already liked, so unlike it (or toggle dislike)
    //       await db.query('DELETE FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
    //       newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
    //     } else {
    //       // User has not liked, so add a like
    //       await db.query('INSERT INTO likes (item_id, user_id, value) VALUES (?, ?, 1)', [itemId, userId]);
    //       newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
    //     }
    //     res.json({ message: 'Like status updated', newLikeCount: newLikeCount[0].count });
    //   } catch (error) {
    //     console.error('Database error:', error);
    //     res.status(500).json({ error: 'Internal server error' });
    //   }

    const existingLike = this.#db.prepare('SELECT * FROM hearts WHERE post_id = ? AND user_id = ?');
    let result = existingLike.all(id, user_id);

    console.log('exisiting:', result.length);

    if (result.length > 0) {
      // User already liked, so unlike it (or toggle dislike)
      const toggle = this.#db.prepare('DELETE FROM hearts WHERE post_id = ? AND user_id = ?');
      result = toggle.run(id, user_id);
      console.log('unheart:', result);
    } else {
      // User has not liked, so add a like
      const toggle = this.#db.prepare('INSERT OR REPLACE INTO hearts (post_id, user_id, value) VALUES (?, ?, ?)');
      result = toggle.run(id, user_id, value);
      console.log('heart:', result);
    }

    const newLikeCount = this.#db.prepare('SELECT COUNT(*) AS count FROM hearts WHERE post_id = ? AND value = 1');
    console.log('new like count for post_id:', id, newLikeCount.get(id).count);

    console.log('Number of rows changed:', result.changes, '@ Row:', result.lastInsertRowid);

    //prettier-ignore
    // const placeholders = Object.keys(HeartsTable).map((col) => `:${col}`).join(', ');
    // const columns = Object.keys(HeartsTable).join(', ');

    // const insertStatement = this.db.prepare(`INSERT OR REPLACE INTO hearts (${columns}) VALUES (${placeholders});`);
    // const values: Hearts = {
    //   post_id: id,
    //   user_id: user_id,
    //   value: value,
    // };

    // const info = insertStatement.run(values);
    // console.log(info)
  }
}

const database = new SQLiteDatabase(appConfig.database);
export default database;
