// import PostService from './src/services/post.service.ts';
// import { Post } from './src/model/Post.model.ts';

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

import { importFolder } from './src/utils/post.utils.ts';

// const dir = process.cwd() + '/test';
// console.log(dir);
// const receipt = await importFolder(dir);
// console.log(receipt?.post.media?.images);
// import path from 'path'
// console.log(path.join(__dirname, './public/uploads'))

function createFolderTree(paths) {
  const tree = []; // This will hold the top-level folders
  const nodesMap = new Map(); // A map for quick lookup of existing nodes by their full path
  // Helper function to create a new folder node
  function createNode(name, parentPath = '') {
    const fullPath = parentPath ? `${parentPath}/${name}` : name;
    return {
      name: name,
      path: fullPath,
      children: [],
    };
  }
  // Sort paths to ensure parents are processed before or with their children
  // This helps in consistent tree construction but isn't strictly necessary with the map.
  // However, it can slightly optimize by often finding parent nodes quickly.
  paths.sort();
  for (const path of paths) {
    const segments = path.split('/');
    let currentLevel: any = tree; // Start at the root level
    let currentPath = ''; // Keep track of the path up to the current segment
    for (let i = 0; i < segments.length; i++) {
      const segmentName = segments[i];
      const segmentFullPath = i === 0 ? segmentName : `${currentPath}/${segmentName}`;
      // Check if this node already exists in our map
      let existingNode: any = nodesMap.get(segmentFullPath);
      if (!existingNode) {
        // If not, create it
        existingNode = createNode(segmentName, currentPath);
        nodesMap.set(segmentFullPath, existingNode);
        // Append it to the current level's children
        currentLevel.push(existingNode);
        // Sort children for consistent output, optional
        currentLevel.sort((a, b) => a.name.localeCompare(b.name));
      }
      // Move to the children of the current node for the next segment
      currentLevel = existingNode.children;
      currentPath = segmentFullPath; // Update currentPath for the next segment
    }
  }
  return tree;
}

const folders = ['test', 'test/folder', 'test/folder/folder copy'];

const tree = createFolderTree(folders);
// console.info(Object.entries(tree));

import util from 'util'


function logAllNames(nodes) {
  for (const node of nodes) {
    console.log(node.name);
    if (node.children && node.children.length > 0) {
      logAllNames(node.children); // Recurse into children
    }
  }
}


console.log(logAllNames(tree))

// console.log(util.inspect(tree, false, null, true))