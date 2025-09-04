import express from 'express';

import { loginLimiter } from '../middleware/limiter.middleware.js';

const route = express.Router();

route.get('/', (req, res) => {
  res.render('login', {
    errorMessage: '',
  });
});

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
route.post('/', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login ', username, password);
    // In a real application, you would query a database
    if (username === 'user' && password === 'pass') {
      req.session.regenerate(() => {
        req.session.user = 'hi';
      });
      // Successful login: set up session, redirect
      res.redirect('/dashboard');
    } else {
      console.log('Content type: ' + Object.keys(req.headers));
      console.log(res.get('content-type'));
      res.format({
        'text/html': () => {
          res.status(401).render('login', {
            errorMessage: 'Invalid username or password',
          });
          // res.json({message:'error2'})
        },
        'application/json': () => {
          res.json({ message: 'not logged in' });
        },
        default: () => {
          // Respond with 406 Not Acceptable if no matching type is found
          res.status(406).send('Not Acceptable');
        },
      });
      console.log('invalid ');
      // res.status(401).send('error')
    }
  } catch (err) {
    console.log('ERROR: ' + err);
    res.status(404).send('error');
  }
});

function restrict(req, res, next) {
  console.log('restrict');
  if (req.session.user) {
    console.log('req user');
    next();
  } else {
    console.log('error');
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

route.get('/restricted', restrict, function (req, res) {
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
