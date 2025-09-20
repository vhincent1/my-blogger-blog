class Post {
  public id: number;
  constructor(id: number) {
    this.id = id;
  }
  public title: string;
  public content: string;

  public labels: string[];
  public date: PostDate; //published, updated
  public author: string;

  public source?: undefined; //url
  public media?: any; //images, videos

  public size: undefined
}

interface PostDate {
  published: Date,
  updated: Date
}

export default Post;

// type MyType = {
//     id: number;
//     name: string;
// }

// type MyGroupType = {
//     [key:string]: MyType;
// }
// var obj: MyGroupType = {
//     "0": { "id": 0, "name": "Available" },
//     "1": { "id": 1, "name": "Ready" },
//     "2": { "id": 2, "name": "Started" }
// };
// // or if you make it an array
// var arr: MyType[] = [
//     { "id": 0, "name": "Available" },
//     { "id": 1, "name": "Ready" },
//     { "id": 2, "name": "Started" }
// ];