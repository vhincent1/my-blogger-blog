import database from '../database/index.database.js';
import PostModel from '../model/Post.model.js';

// image db
import fs from 'fs';
import { fileFormat } from '../utils/io.utils.js';
import appConfig from '../app.config.js';

class PostService {
  blogPosts;
  postSizes;

  constructor(database) {
    this.blogPosts = database.getAllBlogPosts();
    this.generateIds();
    this.postSizes = this.loadSizeTable();
  }

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

  async create(post) {
    try {
      const result = await database.createPost(post);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  async generateIds() {
    let posts = await this.blogPosts;
    posts = posts.reverse();
    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      post.id = index;
    }
    posts = posts.reverse();
  }

  async loadSizeTable() {
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
        total: fileFormat.fileSizeInKb(byteSize + totalImageSize) ,
        format: 'Kb',
      };
    });
    // return sizes;
    // console.log(this.getSizeTable(521))
  }

  async ccccc(){
    //modify img tags
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

export default service;
