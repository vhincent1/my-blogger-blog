import fs from 'fs';
import path from 'path';
import PostService from '../services/post.service.ts';
import { getPaginatedData, getPaginationParameters, getPaginatedQueryDetails } from './pagination.controller.ts';
import { StatusCodes } from 'http-status-codes';

// Example usage:
const targetDirectory = './public/images';
function readDirectoryRecursively(directoryPath) {
  const filesAndFolders: any = [];
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, encodeURIComponent(entry.name));
      const hostPath = fullPath.replace('public', '');
      const fileExt = path.extname(entry.name);
      const fileName = entry.name.replace(fileExt, '');
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
const allItems = readDirectoryRecursively(targetDirectory).filter((item) => path.extname(item.path) == '.png');

const galleryController = {
  index: async (req, res) => {
    const parameters = getPaginationParameters(req, {
      page: 1,
      limit: parseInt(req.query.limit) || 50,
    });

    const serviceResponse = await PostService.getGallery({
      search: req.query.search,
      type: req.query.type,
      filter: 'id',
    });

    const posts = serviceResponse.responseObject;

    const paginatedResult = await getPaginatedData(parameters, posts);
    const paginationQueryDetails = getPaginatedQueryDetails(req, paginatedResult);

    // parameters.data = posts

    // const pagination = await pageController.pagination(req, parameters);
    if (paginatedResult.currentPage > paginatedResult.totalPages) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Page limit exceeded' });
    }
    res.render('v1/gallery', { showFeed: true, images: allItems, pagination: paginationQueryDetails, paginationResult: paginatedResult });
  },
};

export default galleryController;
