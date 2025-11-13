import SQLite3 from 'better-sqlite3';
import type { Post } from '../model/Post.model.ts';
import { PostsTemplate, type PostsTable } from '../model/Tables.model.ts';

export class SQLiteDatabase {
  db;
  constructor() {
    this.db = new SQLite3('database.db');
  }

  async importPosts(posts: Post[]) {
    const columns = Object.keys(PostsTemplate).join(', ');
    // prettier-ignore
    const placeholders = Object.keys(PostsTemplate).map(() => '?').join(', ');
    const query = `INSERT OR REPLACE INTO posts (${columns}) VALUES (${placeholders});`;
    const insertStmt = this.db.prepare(query);
    console.log(query);

    // Execute the statement with values
    // Create a function to run the insertion within a transaction
    const insertPosts = this.db.transaction((postsData) => {
      for (const post of postsData) {
        const values: PostsTable = {
          post_id: post.id,
          user_id: 1,
          title: post.title,
          content: post.content,
          labels: post.labels.toString(),
          created_at: new Date(post.date.published).toISOString(),
          updated_at: new Date(post.date.updated).toISOString(),
          is_published: 1,
          source: post.source?.url,
        };
        insertStmt.run(values.post_id, values.user_id, values.title, values.content, values.labels, values.created_at, values.updated_at, values.is_published, values.source);
      }

      const result = this.db.prepare('SELECT count(*) as count from posts');
      console.log('Successfully inserted', result.get().count, 'rows');
    });
    try {
      insertPosts(posts);
    } catch (err) {
      console.error('Error inserting posts:', err);
    }
  }

  async savePost(post: Post) {
    console.log('Saving: ', post.title);
    const values: PostsTable = {
      post_id: post.id,
      user_id: 1,
      title: post.title,
      content: post.content,
      labels: post.labels.toString(),
      created_at: new Date(post.date.published).toISOString(),
      updated_at: new Date(post.date.updated).toISOString(),
      is_published: 1,
      source: post.source?.url,
    };
    const columns = Object.keys(values).join(', ');
    // prettier-ignore
    const placeholders = Object.keys(values).map((key) => `:${key}`).join(', ');
    const insertStatement = this.db.prepare(`INSERT OR REPLACE INTO posts (${columns}) VALUES (${placeholders})`);
    const info = insertStatement.run(values);
    console.log('Number of rows changed:', info.changes, '@ Row:', info.lastInsertRowid);
  }
}
