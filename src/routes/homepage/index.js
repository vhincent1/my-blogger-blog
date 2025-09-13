import express from 'express';

import authController from '../../controller/auth.controller.js';
import { dashboardController } from '../../controller/dashboard.controller.js';
import galleryController from '../../controller/gallery.controller.js';
import { pageController } from '../../controller/page.controller.js';

const route = express.Router();

route.get('/', pageController.getFrontPage);
route.get('/index', pageController.getIndex);
route.get('/dashboard', /*authController.isAuthenticated,*/ dashboardController.index);
route.get('/gallery', galleryController.index)

import jwt from 'jsonwebtoken';

// const users = [{ username: 'admin', password: '' }];
// route.get('/login/:user', (req, res) => {
//   const user = users.find((user) => user.username == req.params.user);
//   if (!user) {
//     return res.status(401).json({ message: '?' });
//   } else {
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     // res.cookie('user', userData, { httpOnly: true });
//     res
//       .cookie('token', token, { httpOnly: true, path: '/' })
//       .redirect('/protected');

//     // res.json({ token });
//   }
// });

// Middleware to verify JWT
function verifyToken(req, res, next) {
  // const authHeader = req.headers["authorization"];
  // if (!authHeader)
  //   return res.status(401).json({ message: "No token provided" });

  // const token = authHeader.split(" ")[1]; // Expecting "Bearer YOUR_TOKEN"
  // const token = req.cookies.token;

  // console.log("TOKEN "+token)
  // if (!token) return res.status(401).json({ message: "Token not found" });

  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ message: "Invalid token" });
  //   req.user = user; // Attach decoded user information to the request
  //   next(); // Proceed to the next middleware or route handler
  // });

  const token = req.cookies.token;
  console.log('TOKEN ' + token);

  if (!token) {
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, 'mykey');
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token').redirect('/login');
  }
}

// Protected route
route.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.username}! This is a protected route.`,
  });
});

// route.get("/search", pageController.getSearchBlog);
// route.get("/search/label/:label", pageController.getSearchLabel);

export default route;
