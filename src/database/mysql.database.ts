import mysql from 'mysql2/promise';
import type { Post } from '../model/Post.model.ts';

import { type PostsTable, PostsTemplate, buildDuplicateKeyUpdateClause } from '../model/Tables.model.ts';

class MySQLDatabase {
  pool: any;

  constructor() {
    this.pool = mysql.createPool({
      host: '192.168.40.249',
      user: 'blog',
      password: 'password',
      database: 'simpblog',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async importPosts(posts: Post[]) {
    //TODO: fix posts[0]
    // const serviceResponse = await PostService.getPosts();
    // const posts: any = await serviceResponse.responseObject;
    // if (serviceResponse.success == false) {
    //   return console.error('Error: ', serviceResponse);
    // }
    const is_published = 1; // 0 - draft 1 - published
    const values = [posts.map((post: Post) => [post.id, 0, post.title, post.content, post.labels.toString(), post.date.published, post.date.updated, is_published, post.source.url])];
    const columns = Object.keys(PostsTemplate).join(', ');
    const updateClause = buildDuplicateKeyUpdateClause(PostsTemplate);
    const query = `INSERT INTO posts (${columns})  VALUES ? ON DUPLICATE KEY UPDATE ${updateClause}`;
    // console.log(query)
    // const placeholders = Object.keys(PostsTemplate).map(() => '?').join(', ');
    const connection = await this.pool.getConnection();
    const result: any = await connection.query(query, values);
    console.log('Number of records inserted: ' + result[0].affectedRows);
  }

  async getAllBlogPosts() {
    const connection = await this.pool.getConnection();
    const [rows] = await connection.execute(`SELECT * from posts`);
    return rows;
  }

  async savePost(post: Post) {
    const is_published = 1; // 0 - draft 1 - published
    const values: PostsTable = {
      post_id: post.id,
      user_id: 0,
      title: post.title,
      content: post.content,
      labels: post.labels.toString(),
      created_at: post.date.published,
      updated_at: post.date.updated,
      is_published: is_published,
      source: post.source?.url,
    };
    // console.log('values: ', values);
    const columns = Object.keys(PostsTemplate).join(', ');
    // const updateClause = buildDuplicateKeyUpdateClause(PostsTemplate);
    const placeholders = Object.keys(PostsTemplate)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO posts (${columns}) VALUES ${placeholders}`;
    // const query = `INSERT INTO posts SET ?`
    const connection = await this.pool.getConnection();
    const [rows]: any = await connection.execute(query, [values]);
    console.log('Success: ', rows);
  }
}