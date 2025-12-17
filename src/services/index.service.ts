import { postRepository } from '../repository/index.repository.ts';
import PostService from './post.service.ts';

const postService = new PostService(postRepository);

export { postService };
