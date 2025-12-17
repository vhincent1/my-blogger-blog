import type Heart from "./Heart.model.ts";
import type { Post } from "./Post.model.ts";

export interface DatabaseI {
  setup(): void;
  load(): void;
  close(): void;

  // users

  // posts
  importPosts(posts: Post[]): void;
  getAllBlogPosts(): Post[];
  findPostById(id: number): Post | null;

  // createPost(post): void
  // savePost(post): void

  getHearts(): Heart[];
  heartPost(id, user, value);
}
