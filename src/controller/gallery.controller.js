import fs from 'fs';
import path from 'path';

function readDirectoryRecursively(directoryPath) {
  const filesAndFolders = [];
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, encodeURIComponent(entry.name));
      const hostPath = fullPath.replace('public','')
      const fileExt = path.extname(entry.name)
      const fileName = entry.name.replace(fileExt, '')
      console.log(fileName)
      if (entry.isDirectory()) {
        filesAndFolders.push({ type: 'directory', path: hostPath });
        walk(fullPath); // Recursively call for subdirectories
      } else if (entry.isFile()) {
        filesAndFolders.push({ type: 'file', path: hostPath, fileName});
      }
    }
  }
  walk(directoryPath);
  return filesAndFolders;
}

// Example usage:
const targetDirectory = './public/images'; 
// const extension = path.extname(filename).toLowerCase();

// if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.tiff', '.webp'].includes(extension)) {
//     console.log('This is an image file.');
// } else {
//     console.log('This is not a recognized image file extension.');
// }
const allItems = readDirectoryRecursively(targetDirectory).filter(item=> path.extname(item.path) == '.png');
// console.log('All files and folders in', targetDirectory, 'and its subdirectories:');
// allItems.forEach(item => {
//   console.log(`${item.type}: ${item.path}`);
// });
//todo paginated results

const galleryController = {
  index: (req, res) => {
    res.render('gallery', {images: allItems});
  },
};

export default galleryController;
