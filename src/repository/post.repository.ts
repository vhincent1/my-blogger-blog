import database from '../database/index.database.ts';
import Post from '../model/Post.model.ts';
import { buildGallery, buildSizeTable } from '../utils/post.utils.ts';

export const posts: Post[] = await database.getAllBlogPosts();

export class PostRepository {
  private gallery: any;

  constructor() {
    this.generateIds(); // generate post ids
    this.gallery = this.buildGallery();
  }

  //TODO: REMOVE
  async findAllAsync(parameters?): Promise<Post[]> { 
    const p = {
      search: parameters?.search || '',
      type: parameters?.type || '',
      // filter: parameters.filter || null,
      // exclude: parameters.exclude || null
    }
    let data: Post[]
    switch (p.type) {
      case 'content':
        data = posts.filter((post) => post.content.includes(p.search));
        break;
      case 'labels':
        data = posts.filter((post) => post.labels.includes(p.search));
        break;
      case 'title':
        data = posts.filter((post) => post.title.includes(p.search));
        break;
      default:
        data = posts
        break;
    }
    return data
  }

  async findByIdAsync(id: number): Promise<Post | null> {
    return posts.find((post) => post.id === id) || null;
  }

  //searchPosts
  async findAllPostsFiltered(parameters?): Promise<any> {
    const p = {
      search: parameters?.search || '',
      type: parameters?.type || '',
      filter: parameters?.filter || null,
      exclude: parameters?.exclude || null
    }
    // console.log(p)
    let data: any
    switch (p.type) {
      case 'content':
        data = posts.filter((post) => post.content.includes(p.search));
        break;
      case 'labels':
        data = posts.filter((post) => post.labels.includes(p.search));
        break;
      case 'title':
        data = posts.filter((post) => post.title.includes(p.search));
        break;
      default:
        //type not found
        data = posts
        break;
    }
    // properties to only show
    if (p.filter) {
      const desiredProperties = p.filter.split(',')
      const filteredArray = data.map(post => {
        let newObj = {};
        for (const prop of desiredProperties)
          if (post.hasOwnProperty(prop)) newObj[prop] = post[prop];
        return newObj;
      });
      data = filteredArray
    }
    // properties to exclude
    if (p.exclude) {
      const excludedProperties = p.exclude.split(',') //['price', 'category'];
      const newArray = data.map(post => {
        const newItem = { ...post }; // Create a shallow copy
        excludedProperties.forEach(prop => delete newItem[prop]);
        return newItem;
      });
      data = newArray
    }
    // remove empty objects
    data = data.filter(post => Object.keys(post).length > 0);
    return data
  }

  async getGallery() {
    return this.gallery;
  }

  // generates post ids
  private async generateIds() {
    let posts = await this.findAllAsync();
    posts = posts.reverse();
    for (let index = 0; index < posts.length; index++) {
      const post: any = posts[index];
      post.id = index;
      post.size = buildSizeTable(post);
    }
    posts = posts.reverse();
  }

  //   private async formatPosts() {
  //     const posts = await this.findAllAsync()
  //     //modify img tags
  //     for (let index = 0; index < posts.length; index++) {
  //       const post = posts[index];
  //     }
  //   }
  //image sources
  private async buildGallery() {
    const gallery: any = [];
    const posts = await this.findAllAsync();
    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      gallery.push(buildGallery(post));
    }
    return gallery;
  }
}

//test
// const repo = new PostRepository()
// console.log(await repo.getGallery())