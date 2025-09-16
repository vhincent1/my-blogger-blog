import express from 'express'
import multer from 'multer'

const route = express.Router()

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/'); // Destination folder for uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});
const upload = multer({ storage: storage });

// Routes
route.get('/', (req, res) => {
    res.render('upload', { message: '' }); // Render the EJS form
});

route.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imageUrl = '/' + req.file.filename; // Path to the uploaded image
    res.render('upload', { message: 'success', imageUrl: imageUrl }); // Render success page with image
});

route.post('/upload-multiple', upload.array('myFiles', 10), (req, res) => {
    // 'myFiles' is the name attribute in your HTML input field for files
    // 10 is the maximum number of files allowed
    if (!req.files) {
        return res.status(400).send('No files uploaded.');
    }

    // Process the uploaded files (e.g., save paths to a database, move to a permanent location)
    console.log(req.files); // Array of file objects

    res.send('Multiple files uploaded successfully!');
});

export default route;