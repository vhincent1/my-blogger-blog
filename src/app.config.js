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

    // where to save/display exported media
    exportConfig: {
      uploadPath: './public/content/',
      hostPath: 'http://127.0.0.1:3000/content/',
      errorLog: path.resolve('./public/dist', 'missing_images.json'),
      inspectLog: path.resolve('./public/dist', 'manual_download.json')
    },
  },

  database: {
    type: 'json', // storage type
    file: './public/dist/new.json', // blog posts data

    // uploaded media path
    // uploadPath: process.cwd() + '/public/content/',
    uploadPath: '/public/content/',

    // host: 'http://127.0.0.1:3000', // host
  },

  // express config
  server: {
    port: process.env.PORT,
  },
};

export default CONFIG;