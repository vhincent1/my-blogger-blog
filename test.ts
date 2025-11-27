import PostService from './src/services/post.service.ts';
import sqlitedb from './src/database/sqlite.database.ts';

// PostService.heartPost({post_id: 1, user_id: 1, value:1})

for (let i = 0; i < 10; i++) {
  console.log(i); // Outputs 0, 1, 2, 3, 4
  sqlitedb.heartPost(i, 1, 1);
}

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
