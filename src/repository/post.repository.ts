import database from '../database/index.database.ts';
import Post from '../model/Post.model.ts';
import { buildGallery, buildSizeTable } from '../utils/post.utils.ts';
import { filter, truncate } from '../utils/array.utils.ts';

export const posts: Post[] = await database.getAllBlogPosts();

export class PostRepository {
  private gallery: any;

  constructor() {
    this.generateIds(); // generate post ids
    this.gallery = this.buildGallery();
  }

  async findByIdAsync(id: number): Promise<Post | null> {
    return posts.find((post) => post.id === id) || null;
  }

  //searchPosts
  async findAllPostsAsync(parameters?): Promise<any> {
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
      case 'author':
        data = posts.filter(post => post.author.includes(p.search))
        break;
      default:
        //type not found
        data = posts
        break;
    }
    // properties to only show
    if (p.filter) data = await filter(p.filter, data)
    // properties to exclude/truncate
    if (p.exclude) data = await truncate(p.exclude, data)

    // remove empty objects
    data = data.filter(post => Object.keys(post).length > 0);
    return data
  }
  async getGallery() {
    return this.gallery;
  }

  // generates post ids
  private async generateIds() {
    let posts = await this.findAllPostsAsync();
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
    const posts = await this.findAllPostsAsync();
    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      gallery.push(buildGallery(post));
    }
    return gallery;
  }

  filterByYear = async (priorityYear?) => posts?.filter((post) => {
    const year = new Date(post.date.published).getFullYear();
    return year == priorityYear
  })
}

//test
// const repo = new PostRepository()
// console.log(await repo.getGallery())