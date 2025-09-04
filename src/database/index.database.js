import fs from 'fs';
import { readJsonFile } from './json.database.js';
import { fileFormat } from '../utils/io.utils.js';

import appConfig from '../app.config.js'

class Database {
  config; //type,file,host
  blogPosts;
  sizeTable; //id,content,images
  // users;
  // comments;
  constructor(config) {
    this.config = config;
  }

  async load() {
    switch (this.config.type) {
      case 'json':
        this.blogPosts = await readJsonFile(this.config.file);
        this.sizeTable = await this.loadSizeTable();
        this.blogPosts.forEach(async (post) => {
          const size = await this.getSizeTable(post.id);
          if (size) post.size = size;
        });
        break;
      case 'mongo':
        break;
      default:
        break;
    }
  }

  async loadSizeTable() {
    let sizes = [];
    this.blogPosts.forEach(async (post) => {
      // size of images
      let totalImageSize = 0;
      if (post.media)
        for (const filename of post.media.images) {
          const imagePath = this.config.uploadPath + post.author + '/' + filename;
          if (fs.existsSync(imagePath)) {
            const size = fs.statSync(imagePath).size;
            totalImageSize += size;
          }
        }

      // size of post
      const jsonString = JSON.stringify(post, (key, value) => {
        if (key === 'media') return undefined; //ignore media field
        return value;
      });
      const byteSize = Buffer.byteLength(jsonString, 'utf8');

      sizes.push({
        id: post.id,
        content: fileFormat.fileSizeInKb(byteSize) + '(Kb)',
        images: fileFormat.fileSizeInKb(totalImageSize) + '(Kb)',
        total: fileFormat.fileSizeInKb(byteSize + totalImageSize) + '<sup>(Kb)</sup>',
      });
    });
    return sizes;
    // console.log(this.getSizeTable(521))
  }

  async getAllBlogPosts() {
    return this.blogPosts;
  }

  async getSizeTable(id) {
    return this.sizeTable.find((table) => table.id == id);
  }

  async getBlogPostById(id) {
    const post = this.blogPosts.find((post) => post.id === id);
    return post;
  }

  async create() { }

  // // Filter posts by the target tag
  // const targetTag = "art";
  // const taggedPosts = blogPosts.filter((post) => post.labels.includes(targetTag));
  // // console.log(taggedPosts.length);

  // // Sort posts by date (most recent first)
  // const newestPost = blogPosts.sort(
  //   (a, b) => new Date(b.published) - new Date(a.published)
  // );

  // async sortedPost() {
  //   const ascendingOrder = this.blogPosts.sort((a, b) => a.id - b.id);
  //   const descendingOrder = this.blogPosts.sort((a, b) => b.id - a.id);
  // }
}

const database = new Database(appConfig.database);

await database.load();

// console.log( database.getSizeTable(521));
// console.log('Post: ', (await database.getBlogPostById(521)).size);

export default database;
