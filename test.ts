// import PostService from './src/services/post.service.ts';
// import sqlitedb from './src/database/sqlite.database.ts';

// const serviceResponse = await PostService.getPosts();
// const posts: any = serviceResponse.responseObject;
// console.log(serviceResponse);

// PostService.heartPost({post_id: 1, user_id: 1, value:1})

// for (let i = 0; i < 10; i++) {
//   console.log(i); // Outputs 0, 1, 2, 3, 4
//   sqlitedb.heartPost(i, 1, 1);
// }

// sqlitedb.heartPost(1, 1, 1);

// const serviceResponse = await PostService.getPosts();
// const posts: Post[] | null = await serviceResponse.responseObject;

// // console.log(serviceResponse);
// // console.log(posts?.length);

// const unique: any = [];

// posts?.forEach((post) => {
//   if (post.content.includes('tags:')) {
//     const regex = /tags: (?<tags>.+)/;
//     const result: any = post.content.match(regex);
//     if (result !== null) {
//       let { tags } = result.groups;
//       tags = tags.replace(/<[^>]*>?/gm, ''); //remove html elements
//       tags.split(',').forEach((tag: string) => unique.push(tag.trim()));
//     }
//   }
// });

// function count(array) {
//   const counts = {};
//   for (const item of array)
//     counts[item] = (counts[item] || 0) + 1;
//   return counts;
// }

// console.log(count(unique));

// // const o = count(unique);
// // for (const [tag, count] of Object.entries(o)) {
// //   console.log(tag, count);
// // }
// // console.log(new Set(unique));

// import sqliteDb from './src/database/sqlite.database.ts';
// sqliteDb.setup()

//   getResourceSize("http://127.0.0.1:3000/content/VHINCENT/700/s-l1200.webp");

import { readJsonFile } from './src/database/json.database.ts';
import SQLite3 from 'better-sqlite3';
import type { Posts } from './src/model/Tables.model.ts';
import { Post, PostStatus } from './src/model/Post.model.ts';
const db = new SQLite3('./database/test.db');

async function importPosts() {
  const data = await readJsonFile('./public/dist/posts.json');

  const query = `INSERT OR REPLACE INTO posts (id, data) VALUES (?, ?);`;
  const insertStmt = db.prepare(query);

  const insertPosts = db.transaction((postsData) => {
    for (const post of postsData) {
      const values: Posts = {
        id: post.id,
        user_id: 2,
        title: post.title,
        content: post.content,
        labels: post.labels.toString(),
        created_at: post.date.published,
        updated_at: post.date.updated,
        category: post.category,
        source: post.source?.url,
        status: PostStatus.PUBLISHED,
      };
      insertStmt.run(values.id, JSON.stringify(values));
    }
    const result = db.prepare('SELECT count(*) AS count FROM posts');
    console.log('Successfully inserted', result.get().count, 'posts rows');
  });
  try {
    insertPosts(data);
  } catch (error) {
    console.error(error);
  }
}

// importPosts();

function getPost(id: number) {
  const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
  const row = stmt.get(id);
  if (row) {
    return JSON.parse(row.data);
  } else {
    return null;
  }
}

// console.log(getPost(714));

function savePost() {
  const values: Posts = {
    id: 1000,
    user_id: 1,
    title: 'title2',
    content: 'content',
    labels: 'label,label2',
    created_at: new Date(),
    updated_at: new Date(),
    category: 1,
    source: { url: 'https://example.com' },
    status: 1,
  };
  const query = `INSERT OR REPLACE INTO posts (id, data) VALUES (?, ?)`;

  const statement = db.prepare(query).run(values.id, JSON.stringify(values));
  return statement;
}

// console.log(savePost());
// importPosts();

// const update = db.prepare(`UPDATE posts SET data = json_replace(data, '$.user_id', ?) WHERE id = ?`);
// update.run(100, 1);

function mapRowToPost(row) {
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

  // const user: User | null = this.findUserById(row.user_id);
  // if (user) post.author = user.username;
  post.author = 'VHINCENT';

  post.status = row.status;
  post.source = row.source;

  // const images = this.#mapMedia(row.id);
  // if (images) post.media = { images: images };

  return post;
}

// const statement = db.prepare('SELECT * FROM posts WHERE id = ?');
// const row = statement.get(1000);
// console.log(mapRowToPost(JSON.parse(row.data)))

const statement = db.prepare('SELECT * FROM posts ORDER BY id DESC'); //ASC - recent, DESC - oldest
const rows = statement.all();
const all = rows.map((row) => mapRowToPost(JSON.parse(row.data)));
