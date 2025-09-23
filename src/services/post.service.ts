import Post from '../model/Post.model.ts';
import { ServiceResponse } from '../model/ServiceResponse.model.ts';
import { PostRepository } from '../repository/post.repository.ts';
import { StatusCodes } from 'http-status-codes';

class PostService {
  repository: PostRepository;

  constructor(repository: PostRepository) {
    this.repository = repository;
  }

  //filter={type, query}
  //findAll
  async getPosts(filter?) {
    // let posts = await this.repository.findAllAsync(filter);
    // if (filter)
    //   switch (filter.type) {
    //     case 'content':
    //       posts = posts.filter((post) => post.content.includes(filter.query));
    //       break;
    //     case 'labels':
    //       posts = posts.filter((post) => post.labels.includes(filter.query));
    //       break;
    //     case 'title':
    //       posts = posts.filter((post) => post.title.includes(filter.query));
    //       break;
    //     default: //all
    //   }
    try {
      const posts = await this.repository.findAllAsync(filter);
      if (!posts || posts.length === 0)
        return ServiceResponse.failure("No Posts found", null, StatusCodes.NOT_FOUND);
      return ServiceResponse.success<Post[]>("Posts found", posts);
    } catch (ex) {
      const errorMessage = `Error finding all posts: $${(ex as Error).message}`;
      console.log(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving posts.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //findById
  async getPostById(id: number) {
    try {
      const post = await this.repository.findByIdAsync(id)
      if (post == null)
        return ServiceResponse.failure("Post not found", null, StatusCodes.NOT_FOUND);
      return ServiceResponse.success<Post>("Post found", post);
    } catch (ex) {
      const errorMessage = `Error finding post: ${id}: $${(ex as Error).message}`;
      console.log(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving a post.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGallery(filter?) {
    let data = []
    const targetIds: any = []
    const serviceResponse = await this.getPosts(filter)
    if (serviceResponse.success) {
      const posts: any = serviceResponse.responseObject
      for (const post of posts) targetIds.push(post.id)
      const gallery = await this.repository.getGallery()
      data = gallery.filter(result => targetIds.includes(result.postId))
    }
    return data
  }

  // async create(post) {
  //   try {
  //     const result = await database.createPost(post);
  //     return { success: true };
  //   } catch (error) {
  //     return { success: false };
  //   }
  // }


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

const service = new PostService(new PostRepository);
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

