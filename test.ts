import PostService from './src/services/post.service.ts';
import { Post } from './src/model/Post.model.ts';

const serviceResponse = await PostService.getPosts();
const posts: Post[] | null = await serviceResponse.responseObject;

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
