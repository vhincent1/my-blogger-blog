class Post {
  id;
  constructor(id) {
    this.id = id;
  }
  title;
  content;

  labels;
  date; //published, updated
  author;
  source; //url
  media; //images, videos

  size
}

export default Post;
