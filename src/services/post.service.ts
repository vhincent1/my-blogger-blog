import Post from '../model/Post.model.ts';
import { ServiceResponse } from '../model/ServiceResponse.model.ts';
import { PostRepository } from '../repository/post.repository.ts';
import { StatusCodes } from 'http-status-codes';

import { filter, truncate } from '../utils/array.utils.ts';

class PostService {
  repository: PostRepository;

  constructor(repository: PostRepository) {
    this.repository = repository;
  }

  async getPosts(parameters?): Promise<ServiceResponse<Post[] | null>> {
    try {
      const posts = await this.repository.findAllPostsAsync(parameters);
      if (!posts || posts.length === 0)
        return ServiceResponse.failure('No Posts found', parameters, null, StatusCodes.NO_CONTENT);
      return ServiceResponse.success<Post[]>('Posts found', parameters, posts);
    } catch (ex) {
      const errorMessage = `Error finding all posts: $${(ex as Error).message}`;
      console.log(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving posts.',
        parameters,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //findById
  async getPostById(id: number): Promise<ServiceResponse<Post | null>> {
    try {
      const post = await this.repository.findByIdAsync(id)
      if (post == null) return ServiceResponse.failure('Post not found', id, null, StatusCodes.NOT_FOUND);
      return ServiceResponse.success<Post>('Post found', id, post);
    } catch (ex) {
      const errorMessage = `Error finding post: ${id}: $${(ex as Error).message}`;
      console.log(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving a post.', id,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //TODO: service response
  async getGallery(parameters?) {
    let data = []
    const targetIds: any = []
    const serviceResponse = await this.getPosts(parameters)
    if (serviceResponse.success) {
      const posts: any = serviceResponse.responseObject
      for (const post of posts) targetIds.push(post.id)
      const gallery = await this.repository.getGallery()
      data = gallery.filter(result => targetIds.includes(result.postId))
    }
    return data
  }


  async getSortedLabels(parameters?): Promise<ServiceResponse<any>> {
    function countTagOccurrences(tagsArray) {
      const tagCounts = {};
      for (const tag of tagsArray) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      return tagCounts;
    }

    const serviceResponse = await this.getPosts(parameters)
    if (serviceResponse.success) {
      const posts: Post[] | null = serviceResponse.responseObject

      let allLabels: any = [];
      posts?.forEach((post: Post) => allLabels = allLabels.concat(post.labels));

      const uniqueTags = [...new Set(allLabels)];
      // console.log(uniqueTags)
      const labelCount = countTagOccurrences(allLabels.sort().reverse());
      // Convert the object into an array of objects for easier consumption

      const result: any = Object.keys(labelCount).map((label) => ({
        label,
        total: labelCount[label],
      }));
      return ServiceResponse.success<Post>('Get sorted labels', parameters, result);
    }
    return ServiceResponse.failure('No results found', parameters, null, StatusCodes.NO_CONTENT);
  }

  async getPostCountByYear(parameters?): Promise<ServiceResponse<any>> {
    const serviceResponse = await this.getPosts(parameters)
    if (serviceResponse.success) {
      const posts: Post[] | null = serviceResponse.responseObject
      const postCountByYear: any = posts?.reduce((acc, post) => {
        const year = new Date(post.date.published).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {});
      return ServiceResponse.success<Post>('Post count by Year', parameters, postCountByYear);
    }
    return ServiceResponse.failure('No results found', parameters, null, StatusCodes.NOT_FOUND);
  }

  async getPostsByMonthYear(parameters?): Promise<ServiceResponse<any>> {
    const serviceResponse = await this.getPosts(parameters)
    if (serviceResponse.success) {
      const posts: Post[] | null = serviceResponse.responseObject
      const postsByMonthYear: any = posts?.reduce((groups, post) => {
        const date = new Date(post.date.published);
        const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push({ postId: post.id, title: post.title });
        return groups;
      }, {});
      return ServiceResponse.success<Post>('Get posts by Month Year', parameters, postsByMonthYear);
    }
    return ServiceResponse.failure('No results found', parameters, null, StatusCodes.NOT_FOUND);
  }

  // async getPostsByDate(month, year, parameters?) {
  //   const serviceResponse = await this.getPostsByMonthYear(parameters)
  //   const result: any = serviceResponse.responseObject
  //   return result[month.concat(' ', year)];
  // }

  async getArchiveCount(parameters?) {
    let serviceResponse = await this.getPostCountByYear(parameters);
    const postCountByYear = serviceResponse.responseObject

    serviceResponse = await this.getPostsByMonthYear(parameters)
    const postsByMonthYear = serviceResponse.responseObject

    let archiveCount: any = []
    const template: any = {
      parameters,
      archive: {
        YTD: undefined
      }
    }
    try {
      Object.keys(postCountByYear).reverse().forEach((year) => {
        // yearly
        const yearlyPostCount = postCountByYear[year];
        // console.log("--- " + year + " (" + yearlyPostCount + ") ----");
        let YTD: any = {
          year: parseInt(year),
          total: yearlyPostCount,
          MTD: undefined
        };
        let MTD: any = [];
        //monthly
        // key = "Month Year"
        Object.keys(postsByMonthYear).filter((key) => key.includes(year))
          .reverse() // descending order
          .forEach(async (key) => {
            const posts = postsByMonthYear[key];
            const month = key.replace(' ' + year, '');
            const monthCount = posts.length;
            const template: any = {
              month,
              total: monthCount,
              posts
            }
            MTD.push(template)

            // filters
            if (parameters.exclude)
              MTD = await truncate(parameters.exclude, MTD)

            YTD.MTD = MTD;
          });
        //update
        archiveCount.push(YTD);
      });
      template.archive.YTD = archiveCount

      return ServiceResponse.success<any>('Archive count', parameters, template)
    } catch (err) {
      return ServiceResponse.failure('Archive count', parameters, err, StatusCodes.INTERNAL_SERVER_ERROR);
    }
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

// curl -X POST http://localhost:3000/products/update-stock -H 'Content-Type: application/json' -d '{'id': 1, 'quantity': -3}' &

const service = new PostService(new PostRepository);
const posts = await service.getPosts();
export default service;

