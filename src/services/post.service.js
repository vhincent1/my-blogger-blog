import database from '../database/index.database.js';
import PostModel from '../model/Post.model.js';

// image db
import fs from 'fs';
import { fileFormat } from '../utils/io.utils.js';
import appConfig from '../app.config.js';

// content formatting
import parser from 'node-html-parser';
import path from 'path'

class PostService {
  blogPosts;
  postSizes;
  gallery;

  constructor(database) {
    this.blogPosts = database.getAllBlogPosts();
    this.generateIds();
    this.postSizes = this.buildSizeTable();
    this.gallery = this.buildGallery()
  }

  //filter={type, query}
  async getPosts(filter) {
    let posts = await this.blogPosts;
    if (filter)
      switch (filter.type) {
        case 'content':
          posts = posts.filter((post) => post.content.includes(filter.query));
          break;
        case 'labels':
          posts = posts.filter((post) => post.labels.includes(filter.query));
          break;
        case 'title':
          posts = posts.filter((post) => post.title.includes(filter.query));
          break;
        default: //all
      }
    return posts;
  }

  async getPostById(id) {
    const posts = await this.blogPosts;
    return posts.find((post) => post.id === id);
  }

  async getGallery(filter) {
    const targetIds = []
    const posts = await this.getPosts(filter)
    for (const post of posts)
      targetIds.push(post.id)
    const gallery = await this.gallery
    return gallery.filter(result => targetIds.includes(result.postId))
  }

  async create(post) {
    try {
      const result = await database.createPost(post);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  // generates post ids
  async generateIds() {
    let posts = await this.blogPosts;
    posts = posts.reverse();
    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      post.id = index;
    }
    posts = posts.reverse();
  }

  // generates size of post
  async buildSizeTable() {
    const posts = await this.getPosts();
    // console.log(this.blogPosts.length)
    let sizes = [];
    posts.forEach(async (post) => {
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
      post.size = {
        id: post.id,
        content: fileFormat.fileSizeInKb(byteSize),
        images: fileFormat.fileSizeInKb(totalImageSize),
        total: fileFormat.fileSizeInKb(byteSize + totalImageSize),
        format: 'Kb',
      };
    });
    // return sizes;
    // console.log(this.getSizeTable(521))
  }

  //image sources
  async buildGallery() {
    const gallery = []
    const posts = await this.getPosts()
    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      const document = parser.parse(post.content);
      const imagesInPost = []
      const img = document.querySelectorAll('img');
      if (img.length > 0) {
        img.forEach(element => {
          const originalSource = element.getAttribute('src');
          const base = new URL(originalSource).pathname
          //decodeURIComponent
          const fileName = path.basename(base);

          const localPath = base.replace(fileName, '')

          // console.log(filename)
          imagesInPost.push(originalSource)
        })
        gallery.push({ postId: post.id, images: imagesInPost })
      }
    }
    return gallery
  }

  async formatPosts() {
    const posts = await this.blogPosts
    //modify img tags
    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      const document = parser.parse(post.content);

      // <img> tags
      const img = document.querySelectorAll('img');
      img.forEach(element => {
        const originalSource = element.getAttribute('src');
        const base = new URL(originalSource).pathname
        //decodeURIComponent
        const filename = path.basename(base);
        // console.log(filename)
      })

      // <a> tags
      const a = document.querySelectorAll('a')
      a.forEach(element => {
        const href = element.getAttribute('href')
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
      })
    }
  }

  /*
  // Sort in ascending order (oldest to newest)
    data.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA - dateB;
    });
   */
}

// curl -X POST http://localhost:3000/products/update-stock -H "Content-Type: application/json" -d '{"id": 1, "quantity": -3}' &

const service = new PostService(database);
// const a = await database.getAllBlogPosts()
// const a = await service.getPosts({ type: 'title', query: 'outfit' });
const posts = await service.getPosts();

// a.forEach(post =>{
//     console.log(post.size)
// })
// console.log(service.getAllPosts().length)

// console.log( service.getSizeTable(521));
// await service.generateIds();
// const post = await service.getPostById(521)
// console.log(post.title)

// const gallery = await service.gallery()
// for (const [index, data] of Object.entries(gallery)) {

// console.log(index, data)
// }
// gallery.forEach(data => {
//   const postId = data.postId
//   const images = data.images
//   for (const img of images) {
//     // console.log(img)
//   }
// })



export default service;
