import express from 'express';

import authController from '../controller/auth.controller.ts';

import { loginLimiter } from '../middleware/limiter.middleware.ts';

const route = express.Router();

route.get('/', (req, res) => res.format({
  'text/html': () => res.render('login', { errorMessage: '' }),
  'application/json': () => res.json({ message: 'not logged in' }),
  default: () => res.status(406).send('Not Acceptable'),
}));

// Your login route
// route.post('/', loginLimiter, async (req, res) => {
//   const { username, password } = req.body;

//   // Perform authentication logic here (e.g., check against a database)
//   if (username === 'test@example.com' && password === 'testpassword') {
//     res.status(200).json({ message: 'Login successful!', token: 'your_jwt_token_here' });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials.' });
//   }
// });

// POST request for login submission
//curl -X POST -H "Content-Type: application/json" -d '{"username":"test@example.com","password":"testpassword"}' http://localhost:3000/login
route.post('/', loginLimiter, authController.postLogin);

route.get('/restricted', authController.isAuthenticated, function (req, res) {
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

export default route;

// const apiCreatingAccountLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 10, // limit each IP to 10 requests per windowMs,
//   statusCode: 200,
//   message: {
//     status: 429, // optional, of course
//     limiter: true,
//     type: "error",
//     message: 'maximum_accounts'
//   }
// });
