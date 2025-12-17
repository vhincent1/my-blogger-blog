import { Post, PostStatus } from '../../model/Post.model.ts';
import { SQLiteTable } from '../../model/Tables.model.ts';
import type { UsersTable } from './users.table.ts';

export class PostsTable extends SQLiteTable<Post> {
  version: number = 2;
  tableName: string = 'posts';

  #usersTable: UsersTable;
  constructor(db, usersTable) {
    super(db);
    this.#usersTable = usersTable;
  }

  tableScheme(post?: Post) {
    const scheme: {
      id: number | undefined;
      user_id: number;
      title: string;
      content: string;
      labels: string;
      created_at: Date;
      updated_at: Date;
      category: number;
      source: string;
      status: PostStatus;
    } = {
      id: post?.id,
      user_id: post?.user_id || 0,
      title: post?.title || '',
      content: post?.content || '',
      labels: post?.labels.toString() || '',
      created_at: post?.date.published || new Date(),
      updated_at: post?.date.updated || new Date(),
      category: post?.category || 0,
      source: post?.source?.url,
      status: PostStatus.PUBLISHED,
    };
    return scheme;
  }

  mapRowToData(row): Post | null {
    if (!row) return null;
    const post = new Post(row.id);
    post.title = row.title;
    post.content = row.content;
    post.labels = row.labels.split(',');
    post.date = {
      published: new Date(row.created_at),
      updated: new Date(row.updated_at),
    };
    post.category = row.category;

    // const user: User | null = this.findUserById(row.user_id);
    // if (user) post.author = user.username;
    const user = this.#usersTable.findById(row.user_id);
    post.user_id = row.user_id
    post.author = user?.username || '';

    post.status = row.status;
    post.source = row.source;

    // const images = this.#mapMedia(row.id);
    // if (images) post.media = { images: images };
    return post;
  }
}
