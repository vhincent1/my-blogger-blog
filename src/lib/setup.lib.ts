import PostService from '../services/post.service.ts';
import { Post } from '../model/Post.model.ts';

import { SQLiteDatabase } from '../database/sqlite.database.ts';

async function getPosts() {
  const serviceResponse = await PostService.getPosts();
  if (serviceResponse.success == false) {
    console.error('Error: ', serviceResponse);
    process.exit(0);
  }
  const posts: any = await serviceResponse.responseObject;
  return posts;
}

const sqliteDb = new SQLiteDatabase();
const posts = await getPosts();
sqliteDb.importPosts(posts);

// const post: Post = posts.filter((p) => p.id == 681)
// sqliteDb.savePost(post[0]);

// const db = new MySQLDatabase();
// await db.getAllBlogPosts();

// let post = new Post(null);
// post.title = 'title';
// post.content = 'title';
// post.labels = ['label'];
// post.date = { published: new Date(), updated: new Date() };
// post.source = { url: 'null' };
// await db.savePost(post);

// console.log(posts[600])
console.log('done');
process.exit(0);
