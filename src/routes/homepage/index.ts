import express from 'express';

import authController from '../../controller/auth.controller.ts';
import { dashboardController } from '../../controller/dashboard.controller.ts';
import galleryController from '../../controller/gallery.controller.ts';
import { homepageController } from '../../controller/home.controller.ts';

const route = express.Router();

route.get('/', homepageController.getFrontPage);
route.get('/index', homepageController.getIndex);
route.get('/dashboard', /*authController.isAuthenticated,*/ dashboardController.index);
route.get('/gallery', galleryController.index)
route.get('/chart', async (req, res) => { res.render('chart') })
route.get('/search', async (req, res) => {
  const { limit, page } = req.query

  //if(!search)res.status(400).send('Missing search')
  res.render('search')
})
route.get('/v2', async (req, res) => {
  res.render('v2/index', {theme: 1, limit:5})
})

route.get('/v2/index', async (req, res) => {
  const { limit, page } = req.query
  // console.log(req.query)
  res.render('v2/index', {theme: 0, limit: 25})
})

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
route.get('/protected', verifyToken, (req: any, res) => {
  res.json({
    message: `Welcome, ${req.user.username}! This is a protected route.`,
  });
});

// route.get("/search", pageController.getSearchBlog);
// route.get("/search/label/:label", pageController.getSearchLabel);

export default route;
