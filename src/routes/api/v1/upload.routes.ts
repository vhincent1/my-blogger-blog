import express from 'express';
import multer from 'multer';
import { Worker } from 'worker_threads';
import { StatusCodes } from 'http-status-codes';

const route = express.Router();

import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderName = req.body.folderName;
    // console.log(file);

    const uploadPath = `./public/uploads/${folderName}`; //path.join(__dirname, './public/uploads'); // Base upload directory
    // You might need to extract folder structure from the file's originalname
    // and create subdirectories based on that.
    // For simplicity, we'll just put all files in 'uploads' for now.
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // const fileName = file.originalname + '-' + uniqueSuffix + path.extname(file.originalname);
    // cb(null, fileName);
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB in bytes
  },
});

// const upload = multer({ dest: './public/uploads/' });

// Routes
route.get('/', (req, res) => {
  res.render('upload', { message: '' }); // Render the EJS form
});

const MAX_FILES = 2;
route.post('/upload-folder', (req, res) => {
  //upload folder array
  upload.array('folder', 20)(req, res, (err) => {
    const length = req.files?.length;

    console.log(length);
    if (!req.files || req.files.length === 0) {
      console.log('no files', err.message, err.code);
      return res.status(StatusCodes.BAD_REQUEST).send('No files uploaded.');
    } else if (typeof length == 'number' && length > MAX_FILES) {
      console.log('exceeds', length, MAX_FILES);
      return res.status(StatusCodes.REQUEST_TOO_LONG).render('v1/publish', {
        error: {
          code: res.statusCode,
          message: `exceeds file count: ${MAX_FILES}`,
        },
        editting: false,
      });
    }
    //   console.log('files: ', req.files)
  });
});

route.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Extract necessary file data
  const fileData = {
    path: req.file.path,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    // Add other relevant file properties
  };

  // Create a new worker thread
  const worker = new Worker('./worker.js', { workerData: fileData });

  worker.on('message', (result) => {
    console.log('Worker finished processing:', result);
    // Send a response to the client after worker processing
    res.json({ message: 'File uploaded and processed in background', result });
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
    res.status(500).send('Error processing file.');
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker exited with code ${code}`);
    }
  });
});

export default route;
