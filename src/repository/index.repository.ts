import database from '../database/index.database.ts';
import PostRepository from './post.repository.ts';
import UserRepository from './user.repository.ts';

const postRepository = new PostRepository(database);
const userRepository = new UserRepository(database);

export { postRepository, userRepository};
