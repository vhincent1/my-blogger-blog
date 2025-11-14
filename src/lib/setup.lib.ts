// import PostService from '../services/post.service.ts';
// import { Post } from '../model/Post.model.ts';

import sqliteDb from '../database/sqlite.database.ts';

// async function getPosts() {
//   const serviceResponse = await PostService.getPosts();
//   if (serviceResponse.success == false) {
//     console.error('Error: ', serviceResponse);
//     process.exit(0);
//   }
//   const posts: any = await serviceResponse.responseObject;
//   return posts;
// }

// const sqliteDb = new SQLiteDatabase();
// await sqliteDb.getAllBlogPosts()
// sqliteDb.setup()

// const posts = await getPosts();
// sqliteDb.importPosts(posts);

const post = sqliteDb.findPostById(262)
const user = sqliteDb.findUserById(1)
console.log(user?.username)
// console.log(post)

// import { buildSizeTable } from '../utils/post.utils.ts';
// console.log(buildSizeTable(post))

// import fs from 'fs'

// const size = fs.statSync('/Users/vhincent/Programming/web/simpblog/public/content/262/6bd8b0b4-cdb9-429c-9150-02f5def338d5.jpg').size
// console.log(size)

// const post: Post = posts.filter((p) => p.id == 681)
// sqliteDb.savePost(post[0]);

// const db = new MySQLDatabase();
// await db.getAllBlogPosts();

console.log('done');
process.exit(0);
