import { Post } from '../model/Post.model.ts';

import { ServiceResponse } from '../model/ServiceResponse.model.ts';
import PostRepository  from '../repository/post.repository.ts';
import { StatusCodes } from 'http-status-codes';

import { filter, truncate } from '../utils/array.utils.ts';
import Heart from '../model/Heart.model.ts';

class PostService {
  repository: PostRepository;

  constructor(repository: PostRepository) {
    this.repository = repository;
  }

  //todo: crud

  async getPosts(parameters?): Promise<ServiceResponse<Promise<Post[] | null>>> {
    try {
      // TODO: parameters.meta
      // if (parameters.meta) console.log('getPosts: ', parameters.meta);
      // if (parameters) parameters.meta = { source: 'getPosts' };
      const posts = this.repository.findAllPostsAsync(parameters);
      // const posts = await this.repository.findAllPostsAsync(parameters);
      if (!posts) return ServiceResponse.failure('No Posts found', parameters, Promise.resolve(null), StatusCodes.NO_CONTENT);
      return ServiceResponse.success<Promise<Post[]>>('Posts found', parameters, posts);
    } catch (ex) {
      const errorMessage = `Error finding all posts: $${(ex as Error).message}`;
      console.log(errorMessage);
      return ServiceResponse.failure('An error occurred while retrieving posts.', parameters, Promise.resolve(null), StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //findById
  async getPostById(id: number): Promise<ServiceResponse<Post | null>> {
    try {
      const post = await this.repository.findByIdAsync(id);
      if (post == null) return ServiceResponse.failure('Post not found', id, null, StatusCodes.NOT_FOUND);
      return ServiceResponse.success<Post>('Post found', id, post);
    } catch (ex) {
      const errorMessage = `Error finding post: ${id}: $${(ex as Error).message}`;
      console.log(errorMessage);
      return ServiceResponse.failure('An error occurred while retrieving a post.', id, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getGallery(parameters?): Promise<ServiceResponse<any>> {
    let data = [];
    if (parameters) parameters.meta = { source: 'getGallery' };
    const serviceResponse = await this.getPosts(parameters);
    try {
      if (serviceResponse.success) {
        const posts: any = await serviceResponse.responseObject;
        const targetIds: any = [];
        for (const post of posts) targetIds.push(post.id);
        const gallery = await this.repository.getGallery();
        data = gallery.getEntries().filter((result) => targetIds.includes(result.postId));
      }
    } catch (err) {
      return ServiceResponse.failure<any>('Error building gallery', parameters, err);
    }
    return ServiceResponse.success<any>('Build gallery', parameters, data);
  }

  async getSortedLabels(parameters?): Promise<ServiceResponse<any>> {
    try {
      // const result = await this.repository.sortedLabels(parameters);
      let data = await this.repository.findAllPostsAsync(parameters);
      function countTagOccurrences(tagsArray) {
        const tagCounts = {};
        for (const tag of tagsArray) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        return tagCounts;
      }
      let allLabels: any = [];
      data?.forEach((post: Post) => (allLabels = allLabels.concat(post.labels)));
      const uniqueTags = [...new Set(allLabels)];
      // console.log(uniqueTags)
      const labelCount = countTagOccurrences(allLabels.sort().reverse());
      // Convert the object into an array of objects for easier consumption
      const result: any = Object.keys(labelCount).map((label) => ({
        label,
        total: labelCount[label],
      }));
      return ServiceResponse.success<Post>('Get sorted labels', parameters, result);
    } catch (err) {
      return ServiceResponse.failure('No results found', parameters, null, StatusCodes.NO_CONTENT);
    }
  }

  async getPostCountByYear(parameters?): Promise<ServiceResponse<any>> {
    if (parameters) parameters.meta = { source: 'getPostCountByYear' };
    const serviceResponse = await this.getPosts(parameters);
    if (serviceResponse.success) {
      const posts: Post[] | null = await serviceResponse.responseObject;

      const postCountByYear: any = posts?.reduce((acc, post) => {
        const year = new Date(post.date.published).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {});

      // const postCountByYear: any = this.repository.postCountByYear()

      return ServiceResponse.success<Post>('Post count by Year', parameters, postCountByYear);
    }
    return ServiceResponse.failure('No results found', parameters, null, StatusCodes.NOT_FOUND);
  }

  async getPostsByMonthYear(parameters?): Promise<ServiceResponse<any>> {
    if (parameters) parameters.meta = { source: 'getPostsByMonthYear' };
    const serviceResponse = await this.getPosts(parameters);
    if (serviceResponse.success) {
      const posts: Post[] | null = await serviceResponse.responseObject;
      const postsByMonthYear: any = posts?.reduce((groups, post) => {
        const date = new Date(post.date.published);
        const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push({ postId: post.id, title: post.title });
        return groups;
      }, {});

      // const postsByMonthYear: any = this.repository.postsByMonthYear()
      return ServiceResponse.success<Post>('Get posts by Month Year', parameters, postsByMonthYear);
    }
    return ServiceResponse.failure('No results found', parameters, null, StatusCodes.NOT_FOUND);
  }

  async heartPost(parameters): Promise<ServiceResponse<any>> {
    if (parameters) parameters.meta = { source: 'heartPost' };
    // this.repository.heartPost(parameters);

    const heart = new Heart(0, 0, 0);
    return ServiceResponse.success<Heart>('Send heart', parameters, heart);
  }

  async getArchive(parameters?: any) {
    interface MonthEntry {
      month: string;
      total: number;
      posts: any[];
    }

    interface YearEntry {
      year: number;
      total: number;
      MTD: MonthEntry[];
    }

    interface ArchiveResponse {
      parameters: any;
      archive: {
        YTD: YearEntry[];
      };
    }
    try {
      if (parameters) parameters.meta = { source: 'getArchive' };
      // 2. Fetch data in parallel (Performance Boost)
      const [yearResponse, monthResponse] = await Promise.all([this.getPostCountByYear(parameters), this.getPostsByMonthYear(parameters)]);

      const postCountByYear = yearResponse.responseObject;
      const postsByMonthYear = monthResponse.responseObject;

      // 3. Process Years (Use map + Promise.all to handle async operations inside)
      const years = Object.keys(postCountByYear).reverse();

      const archiveYTD = await Promise.all(
        years.map(async (yearStr) => {
          const yearInt = parseInt(yearStr, 10);

          // Filter months for this specific year
          const relevantMonthKeys = Object.keys(postsByMonthYear)
            .filter((key) => key.includes(yearStr))
            .reverse(); // Descending order

          // Map keys to Month Entries
          let mtdData: MonthEntry[] = relevantMonthKeys.map((key) => {
            const posts = postsByMonthYear[key];
            // robust replacement: "January 2023" -> "January"
            const monthName = key.replace(new RegExp(`\\s${yearStr}$`), '');

            return {
              month: monthName,
              total: posts.length,
              posts: posts,
            };
          });

          // 4. Handle Truncation correctly (Await the result)
          if (parameters?.exclude) {
            // Assuming truncate is a utility function you have elsewhere
            mtdData = await truncate(parameters.exclude, mtdData);
          }

          return {
            year: yearInt,
            total: postCountByYear[yearStr],
            MTD: mtdData,
          };
        })
      );

      // 5. Construct Final Response
      const template: ArchiveResponse = {
        parameters,
        archive: {
          YTD: archiveYTD,
        },
      };

      return ServiceResponse.success('Archive count', parameters, template);
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

// const service = new PostService(new PostRepository());
// // const posts = await service.getPosts();
// export default service;
export default PostService
