import appConfig from '../app.config.ts';
// image db
import { fileFormat, getFileSize, checkFileExistence } from './io.utils.ts';
// content formatting
import parser from 'node-html-parser';
import path from 'path';
import type { GalleryEntry } from '../model/Gallery.model.ts';

// generates size of post
export async function buildSizeTable(post) {
  const document = parser.parse(post.content);

  let totalImageSize = 0;
  const imgElements: any = document.querySelectorAll('img');
  for (const img of imgElements) {
    const filename = path.basename(img.getAttribute('src'));
    const imagePath = appConfig.database.contentPath(post) + decodeURIComponent(filename);
    if (await checkFileExistence(imagePath)) {
      const size = await getFileSize(imagePath);
      totalImageSize += size;
    } else {
      // console.log(`[buildSizeTable(${post.id})] doesnt exist: ${imagePath}`);
    }

    // if(post.id ==262){
    //   console.log(filename)
    // }
  }

  // size of post
  const jsonString = JSON.stringify(post, (key, value) => {
    if (key === 'media') return undefined; //ignore media field
    if (key === 'size') return undefined; //ignore size field
    return value;
  });
  const byteSize = Buffer.byteLength(jsonString, 'utf8');

  //   post.size = {
  return {
    id: post.id,
    content: fileFormat.formatBytes(byteSize),
    images: fileFormat.formatBytes(totalImageSize),
    total: fileFormat.formatBytes(byteSize + totalImageSize),
  };
}

export function buildGallery(post) {
  const document = parser.parse(post.content);
  const imagesInPost: any = [];
  const img = document.querySelectorAll('img');

  const nsfw = document.querySelectorAll('nsfw'); //widget
  let isNSFW = nsfw.length > 0 ? true : false;

  if (img.length > 0) {
    img.forEach((element) => {
      const originalSource = element.getAttribute('src');
      // if (isValidUrl(originalSource)) {
      //   const base = new URL(originalSource).pathname
      //   //decodeURIComponent
      //   const fileName = path.basename(base);

      //   const localPath = base.replace(fileName, '')

      //   // console.log(filename)
      imagesInPost.push(originalSource);
      // } else {
      //   console.log('not valid')
      // }
    });
    // gallery.push({ postId: post.id, images: imagesInPost });
    const entry: GalleryEntry = { postId: post.id, title: post.title, images: imagesInPost, isNSFW };
    return entry;
  }
  return null;
}

export function format(post) {
  const document = parser.parse(post.content);

  //resize <youtube> videos

  // <img> tags
  const img = document.querySelectorAll('img');
  img.forEach((element) => {
    const originalSource: any = element.getAttribute('src');
    const base = new URL(originalSource).pathname;
    //decodeURIComponent
    const filename = path.basename(base);
    // console.log(filename)
  });

  // <a> tags
  const a = document.querySelectorAll('a');
  a.forEach((element) => {
    const href = element.getAttribute('href');
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch (err) {
        return false;
      }
    };
    if (isValidUrl(href)) {
      // console.log(href)
    }
  });
}

//import from folder

import * as fs2 from 'fs/promises';
import { Post, PostStatus, getPostStatusByName } from '../model/Post.model.ts';
export async function importFolder(directoryPath) {
  async function readFolderContents(dirPath) {
    try {
      const files = await fs2.readdir(dirPath);
      console.log(`Contents of ${dirPath}:`, files);
      return files;
    } catch (err) {
      console.error(`Error reading directory ${dirPath}:`, err);
      throw err; // Re-throw the error for further handling if needed
    }
  }
  function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex !== -1 && lastDotIndex < filename.length - 1)
      // Ensure a valid dot position
      return filename.substring(lastDotIndex + 1);
    return ''; // No extension found
  }

  const isAnImageFile = (filename) => {
    // // Allowed file extensions
    // const filetypes = /jpeg|jpg|png|gif|pdf/;
    // // Check extension
    // const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // // Check mime type
    // const mimetype = filetypes.test(file.mimetype);
    const imagesExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'apng', 'svg'];
    return imagesExtensions.includes(getFileExtension(filename));
  };

  async function readFilesSequentially(dirPath, sortedFileNames) {
    const fileContents: any = [];
    for (const filename of sortedFileNames) {
      const filePath = path.join(dirPath, filename);
      try {
        const content = await fs2.readFile(filePath, { encoding: 'utf8' });
        fileContents.push({ filename, content });
      } catch (err) {
        console.error(`Error reading file ${filename}:`, err);
      }
    }
    return fileContents;
  }

  //readme file
  async function parseReadMe(filePath) {
    try {
      const fileContent: any = await fs2.readFile(filePath, 'utf8');
      // Remove single-line comments (//)
      let processedContent = fileContent.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments (/* ... */)
      processedContent = processedContent.replace(/\/\*[\s\S]*?\*\//g, '');
      function parse(inputString) {
        const result = {};
        const lines = inputString.split('\n');
        let inMultiLineComment = false;
        for (const line of lines) {
          let trimmedLine = line.trim();
          // 1. Handle multi-line comments
          if (inMultiLineComment) {
            if (trimmedLine.endsWith('*/')) inMultiLineComment = false;
            continue; // Skip lines inside multi-line comment
          }
          if (trimmedLine.startsWith('/*')) {
            if (!trimmedLine.endsWith('*/'))
              // If it's not a single-line /*...*/ comment
              inMultiLineComment = true;
            continue; // Skip line that starts multi-line comment
          }
          // 2. Ignore single-line comments
          const commentIndex = trimmedLine.indexOf('//');
          if (commentIndex !== -1) trimmedLine = trimmedLine.substring(0, commentIndex).trim();
          // 3. Ignore empty lines after comment stripping
          if (trimmedLine === '') continue;
          // 4. Extract key and value
          const colonIndex = trimmedLine.indexOf(':');
          if (colonIndex !== -1) {
            let key = trimmedLine.substring(0, colonIndex).trim();
            let value = trimmedLine.substring(colonIndex + 1).trim();
            // Convert key to camelCase for consistency in JS object
            const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            result[camelCaseKey] = value;
          }
        }
        return result;
      }
      const parsedData: any = parse(fileContent);
      return parsedData;
    } catch (error) {
      console.error('Error reading or processing the file:', error);
      return null;
    }
  }

  async function moveFile(oldPath, newPath) {
    try {
      await fs2.rename(oldPath, newPath);
      console.log('File moved successfully');
    } catch (error: any) {
      if (error.code === 'EXDEV') {
        // Handle cross-device link errors (e.g., moving between different file systems)
        // Fallback to copy and then delete
        await fs2.copyFile(oldPath, newPath);
        await fs2.unlink(oldPath);
        console.log('File moved successfully (copied and deleted)');
      } else {
        console.error('Error moving file:', error);
        throw error; // Re-throw the error for further handling
      }
    }
  }

  const result = readFolderContents(directoryPath)
    .then(async (files) => {
      console.log('dp:', directoryPath);
      //read files in alphabetical order
      files = files.sort((a, b) => a.localeCompare(b));

      console.log(files);

      // files.forEach(f=>{
      //   console.log(isAnImageFile(f))
      // })

      const post = new Post(null);

      //readme file
      const readmeFileExists = files.find((f) => f.toUpperCase().includes('README'));
      if (readmeFileExists) {
        const readmeFile = `${directoryPath}/${readmeFileExists}`;
        const readme = await parseReadMe(readmeFile);
        if (readme.title) {
          post.title = readme.title;
        } else {
          // folder name
          post.title = path.basename(directoryPath);
        }
        post.labels = readme.labels.split(',');
        post.status = getPostStatusByName(readme.status);
      } else {
        console.error('README file not found');
        return;
      }
      // parse content
      let content = '';
      const contentFiles = files.filter((file) => {
        const fileExt = getFileExtension(file);
        if (fileExt == 'txt') return true;
        if (fileExt == 'html') return true;
      });

      const contents = await readFilesSequentially(directoryPath, contentFiles);
      contents.forEach((file) => {
        console.log(`--- Content of ${file.filename} ---`);
        // console.log(file.content);
        content += file.content;
      });
      console.log('Content:', content);
      post.content = content;
      post.date = {
        published: new Date(),
        updated: new Date(),
      };
      post.media = {
        images: files.filter((f) => isAnImageFile(f)),
      };

      // parse html
      const document = parser.parse(post.content);

      const img = document.querySelectorAll('img');

      img.forEach((element) => {
        console.log('element:', element.getAttribute('src'));
      });

      // const uploadPath = `${process.cwd()}/public/content/`;
      // const hostURL = appConfig.database.contentPath(uploadPath, post);
      const hostURL = appConfig.database.contentPath(post);
      console.log('image path:', hostURL);

      return { success: true, post };

      // const document = parser.parse(post.content);
    })
    .catch((error) => {
      console.error('An error occurred during folder reading:', error);
    });

  return result;
}
