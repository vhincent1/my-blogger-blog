export class Post {
  public id: number | undefined;

  constructor(id: number | undefined) {
    this.id = id;
  }

  public title: string;
  public content: string;
  public labels: string[];

  public date: PostDate = {
    published: new Date(),
    updated: new Date(),
  };

  public user_id: number;
  public author: string;

  public status: PostStatus = PostStatus.PUBLISHED;
  public category: number = 0;

  public comments?: undefined;
  public source?: any; //url
  public media?: any; //images, videos
  public size?: undefined;
}

export enum PostStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  DELETED = 2,
}

export function getPostStatusByName(value) {
  const name = value.toUpperCase();
  //prettier-ignore
  if (Object.prototype.hasOwnProperty.call(PostStatus, name)
     && typeof PostStatus[name] === 'number') 
        return PostStatus[name];
  return PostStatus.DRAFT;
}

export interface PostDate {
  published: Date;
  updated: Date;
}

// search parameters
export interface PostParameters {
  search: string;
  type: string;
  filter?: string;
  exclude?: string;
}
