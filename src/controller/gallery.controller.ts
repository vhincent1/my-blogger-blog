import fs from 'fs';
import path from 'path';
import PostService from '../services/post.service.ts'
import { pageController, type Pagination } from './page.controller.ts';


// Example usage:
const targetDirectory = './public/images';
function readDirectoryRecursively(directoryPath) {
  const filesAndFolders: any = [];
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, encodeURIComponent(entry.name));
      const hostPath = fullPath.replace('public', '')
      const fileExt = path.extname(entry.name)
      const fileName = entry.name.replace(fileExt, '')
      // console.log(fileName)
      if (entry.isDirectory()) {
        filesAndFolders.push({ type: 'directory', path: hostPath });
        walk(fullPath); // Recursively call for subdirectories
      } else if (entry.isFile()) {
        filesAndFolders.push({ type: 'file', path: hostPath, fileName });
      }
    }
  }
  walk(directoryPath);
  return filesAndFolders;
}
// const extension = path.extname(filename).toLowerCase();

// if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.tiff', '.webp'].includes(extension)) {
//     console.log('This is an image file.');
// } else {
//     console.log('This is not a recognized image file extension.');
// }
const allItems = readDirectoryRecursively(targetDirectory).filter(item => path.extname(item.path) == '.png');
// console.log('All files and folders in', targetDirectory, 'and its subdirectories:');
// allItems.forEach(item => {
//   console.log(`${item.type}: ${item.path}`);
// });
//todo paginated results

const galleryController = {
  index: async (req, res) => {
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 200;
    // const skip = (page - 1) * limit;//offset

    // const fullArray = await PostService.gallery();
    // const paginatedResults = fullArray.slice(skip, skip + limit);

    // const totalItems = fullArray.length;
    // const totalPages = Math.ceil(totalItems / limit);

    // const hasNextPage = page < totalPages;
    // const hasPreviousPage = page > 1;
    const parameters: Pagination = {
      page: parseInt(req.query.page as string) || 0,
      limit: parseInt(req.query.limit as string) || 50,

      query: req.query.search as string,
      type: req.query.type as string,
    };

    // const serviceResponse = await PostService.getGallery(parameters);
    const posts = await PostService.getGallery(parameters);
    parameters.data = posts

    const pagination = await pageController.pagination(req, parameters);
    if (pagination.currentPage > pagination.totalPages)
      return res.status(404).json({ error: 'Page limit exceeded' });
    res.render('gallery', { images: allItems, pagination });
  },
};

export default galleryController;