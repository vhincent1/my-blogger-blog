import path from 'path';

const CONFIG = {
  // blogger.lib.js config
  blogger: {
    // blogger api settings
    apiKey: process.env.BLOGGER_API_KEY,
    blogId: '7847840505089960893',

    // where to save export data
    exported: './public/dist/blogger-export.json',
    new: './public/dist/new.json',

    // where to save/display exported media (updates <img src> tags)
    exportConfig: {
      enabled: true,
      uploadPath: './public/content/', // folder path
      hostPath: '/content/', // img src tags
      // hostPath: 'http://127.0.0.1:3000/content/',
      // hostPath: 'http://192.168.40.220:3000/content/',
      storageDir: (hostPath, bloggerPost, index) => hostPath + bloggerPost.author.displayName + '/' + index, // SAME THING
      errorLog: path.resolve('./public/dist', 'missing_images.txt'),
      inspectLog: path.resolve('./public/dist', 'manual_download.json'),
      //   uploadPath: (path, post, index)=> path + post.author.displayName + '/' + index,
    },
  },

  database: {
    type: 'json', // storage type
    file: './public/dist/new.json', // blog posts data
    // uploaded media path
    uploadPath: process.cwd() + '/public/content/',
    // host: 'http://127.0.0.1:3000', // host
    // where content is stored (./public/content/AUTHOR/POST_ID)
    contentPath: (uploadPath, post) => uploadPath + post.author + '/' + post.id + '/', // SAME THING
  },

  // express config
  server: { port: process.env.PORT },

  // EJS template
  ejs: {
    links: {
      searchLabel: (item) => `/?search=${item}&type=labels`,
      viewPost: (post) => `/post/${post.id}`,
      editPost: (post) => `/post/${post.id}/edit`,
      createPost: '/post',
      footerLinks: {
        "/": "Home",
        "/index": "Index",
        "/login": "Login",
        "/dashboard": "Dashboard",
        "/post": "Post",
        "/gallery": "Gallery"
      }
    }
  }
};

export default CONFIG;
