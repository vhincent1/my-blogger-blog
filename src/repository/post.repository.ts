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

  //filter={type, query}
  async findAllAsync(filter?): Promise<Post[]> {
    let type: string = '';
    if(filter) type = filter.type
      switch (type) {
        case 'content': return posts.filter((post) => post.content.includes(filter.query));
        case 'labels': return posts.filter((post) => post.labels.includes(filter.query));
        case 'title': return posts.filter((post) => post.title.includes(filter.query));
        default: return posts
      }
  }

  async findByIdAsync(id: number): Promise<Post | null> {
    return posts.find((post) => post.id === id) || null;
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