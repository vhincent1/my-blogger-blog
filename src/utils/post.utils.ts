import appConfig from '../app.config.ts';
// image db
import fs from 'fs';
import { fileFormat } from './io.utils.ts';
// content formatting
import parser from 'node-html-parser';
import path from 'path';

// generates size of post
export function buildSizeTable(post) {
  // size of images
  let totalImageSize = 0;
  if (post.media)
    for (const filename of post.media.images) {
      // console.log(decodeURIComponent(filename))
      const imagePath = appConfig.database.contentPath(appConfig.database.uploadPath, post) + decodeURIComponent(filename);
      if (fs.existsSync(imagePath)) {
        const size = fs.statSync(imagePath).size;
        totalImageSize += size;
      } else {
        // console.log('post: '+post.id)
        // console.log('doesnt exist: ' + imagePath)
      }
    }

  // if(totalImageSize>0) console.log(post.id)

  // size of post
  const jsonString = JSON.stringify(post, (key, value) => {
    if (key === 'media') return undefined; //ignore media field
    return value;
  });
  const byteSize = Buffer.byteLength(jsonString, 'utf8');
//   post.size = {
  return {
    id: post.id,
    content: fileFormat.fileSizeInKb(byteSize),
    images: fileFormat.fileSizeInKb(totalImageSize),
    total: fileFormat.fileSizeInKb(byteSize + totalImageSize),
    format: 'Kb',
  };
}

export function buildGallery(post) {
  const document = parser.parse(post.content);
  const imagesInPost: any = [];
  const img = document.querySelectorAll('img');

  const nsfw = document.querySelectorAll('nsfw') //widget
  let isNSFW = nsfw.length > 0? true : false
  
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
    return { postId: post.id, title:post.title, images: imagesInPost, isNSFW }
  }
  return {};
}

export function format(post) {
  const document = parser.parse(post.content);

  // <img> tags
  const img = document.querySelectorAll('img');
  img.forEach((element) => {
    const originalSource = element.getAttribute('src');
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