// const links = {
//     "/" : "Home",
//     "/index" : "Index",
//     "/login" : "Login",
//     "/dashboard" : "Dashboard"
// }
// for (const [route, label] of Object.entries(links)) {
//     console.log(`The route is "${route}" and the label is "${label}".`);
// }
// for (const route in links) {
//     if (Object.hasOwn(links, route)) { // Use this check to be safe
//         console.log(`The route is "${route}" and the label is "${links[route]}".`);
//     }
// }
import path from 'path'
const originalSource = 'http://127.0.0.1:3000/content/VHINCENT/534/long%20pipe.png'
const base = new URL(originalSource).pathname

const fileName1 = path.basename(base)
const filename = decodeURIComponent(path.basename(base));

console.log(base)
console.log(base.replace(fileName1, ''))
console.log(filename)


// import exifreader from 'exifreader';
// import fs from 'fs'

// async function readImageMetadata(imagePath) {
//     try {
//         const buffer = fs.readFileSync(imagePath);
//         const tags = exifreader.load(buffer);

//         console.log(tags)

//         // Access specific tags
//         console.log('Date Taken:', tags.DateTimeOriginal ? tags.DateTimeOriginal.description : 'N/A');
//         console.log('Camera Model:', tags.Model ? tags.Model.description : 'N/A');
//         console.log('GPS Latitude:', tags.GPSLatitude ? tags.GPSLatitude.description : 'N/A');
//         console.log('GPS Longitude:', tags.GPSLongitude ? tags.GPSLongitude.description : 'N/A');

//         // Log all tags for a comprehensive view
//         // console.log(tags); 
//     } catch (error) {
//         console.error('Error reading image metadata:', error);
//     }
// }

// // Replace 'path/to/your/image.jpg' with the actual path to your image file
// readImageMetadata('./public/content/VHINCENT/534/long pipe.png');