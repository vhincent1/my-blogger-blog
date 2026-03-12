import jwt from 'jsonwebtoken';

import { StatusCodes } from 'http-status-codes';
import { ServiceResponse } from '../model/ServiceResponse.model.ts';

import { Buffer } from "node:buffer";

function index(req, res) {
  return res.format({
    'text/html': () => res.render('login', { errorMessage: '' }),
    'application/json': () => res.json({ message: 'not logged in' }),
    default: () => res.status(StatusCodes.NOT_ACCEPTABLE).send('Not Acceptable'),
  });
}

// middleware
function isAuthenticated(req, res, next) {
  const enabled = true;
  if (!enabled) {
    next();
  } else {
    if (req.session.user) {
      console.log('req user');
      // next();
      next();
    } else {
      console.log('error, not logged in' + req.session.user);
      req.session.error = 'Access denied!';
      // res.status(404).send('Error')
      // notFound(req, res, next);
      return res.format({
        'text/html': () => res.render('login', { errorMessage: 'Not logged in' }),
        'application/json': () => res.json({ message: 'not logged in' }),
        default: () => res.status(StatusCodes.NOT_ACCEPTABLE).send('Not logged in'),
      });
    }
  }
}

const JWT_SECRET = 'your_super_secret_key';
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.send(ServiceResponse.failure('Authorization failed. No access token.', authHeader, null, StatusCodes.UNAUTHORIZED));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.send(ServiceResponse.failure('Could not verify token. Invalid or expired.', authHeader, err.message, StatusCodes.FORBIDDEN));
    }
    req.user = user;
    next();
  });
};

async function postLogin(req, res, next) {
  console.log('postLogin');
  const { username, password } = req.body;

  // Example: Encoding the submitted password to base64 (for demonstration only)
  const submittedPasswordBase64 = Buffer.from(password, 'utf8').toString('base64');

  try {
    // Attempt to authenticate the user (e.g., database lookup, password check)
    const user: any = await authenticateUser(username, submittedPasswordBase64);

    console.log('postLogin: ', user);

    if (!user) {
      // If authentication fails, create a specific error (e.g., 401 Unauthorized)
      const error: any = new Error('Invalid username or password');
      error.status = StatusCodes.UNAUTHORIZED; // Custom property to store HTTP status code

      req.session.error = 'Authentication failed.';

      const serviceResponse = ServiceResponse.failure('postLogin', req.body, { message: error.message }, StatusCodes.NOT_ACCEPTABLE);

      //  return res.redirect('/login')
      // return next(error); // Pass the error to the error handler
      return res.format({
        'text/html': () => res.status(401).render('login', { errorMessage: error.message }),
        'application/json': () => res.send(serviceResponse),
        default: () => res.status(StatusCodes.NOT_ACCEPTABLE).send(error.message),
      });
    }

    //  // 2. Authentication successful: store temporary session data if needed
    const tempSessionData = req.session.some_var;

    // // 3. Regenerate the session ID
    req.session.regenerate((err) => {
      if (err) return next(err);

      // 4. Assign user data and any preserved data to the new session
      req.session.user = user;
      req.session.some_var = tempSessionData; // Restore data

      const token = jwt.sign({ user: user }, JWT_SECRET, { expiresIn: '1h' });

      // 5. Save the session and redirect the user
      // Optionally use req.session.save() if you need to ensure the session is saved before redirecting
      // res.redirect('/dashboard');
      const responseData = { user, token };
      const serviceResponse = ServiceResponse.success('postLogin', req.body, responseData, StatusCodes.ACCEPTED);

      // req.session.save((err) => {});
      return res.format({
        'text/html': () => res.redirect('/dashboard'), //res.status(StatusCodes.ACCEPTED).render('dashboard', { user }),
        'application/json': () => res.send(serviceResponse),
        default: () => res.send(serviceResponse),
      });
    });

    // If successful, proceed with login logic (e.g., create session, send response)
    // res.status(200).json({ message: 'Login successful', user: user });
    // res.format({
    //   'text/html': () => res.redirect('/dashboard'),//res.status(StatusCodes.ACCEPTED).render('dashboard', { user }),
    //   'application/json': () => res.status(StatusCodes.ACCEPTED).json({ user }),
    //   default: () => res.status(StatusCodes.ACCEPTED).send(user),
    // });
  } catch (err) {
    // If an unexpected error occurs (e.g., database error), pass it to the error handler
    return next(err);
  }
}

// Helper function placeholder
async function authenticateUser(username, password) {
  // Your authentication logic here
  // from database
  // Return user object if valid, null otherwise
  // Or throw an error for connection issues

  const encodedB64Pw = Buffer.from(password, 'base64').toString('utf8');

  if (username === 'user' && encodedB64Pw === 'pass') {
    return { username: 'user' };
  }

  return null;
}

const authController = { index, isAuthenticated, postLogin, authenticateToken };

export default authController;

// app.post('/login', async (req, res, next) => {
//   try {
//     // Authenticate user (e.g., database check)
//     const user = await User.findOne({ username: req.body.username });

//     if (user) {
//       // Store user ID in the session (good practice to only store ID, not whole object)
//       req.session.userId = user._id;

//       // Explicitly save the session to the store.
//       // This is an asynchronous operation and should be awaited
//       // or handled with a callback to prevent race conditions.
//       await new Promise((resolve, reject) => {
//         req.session.save((err) => {
//           if (err) return reject(err);
//           resolve();
//         });
//       });

//       // Redirect only after the session is confirmed saved
//       res.redirect('/dashboard');
//     } else {
//       res.status(401).send('Invalid credentials');
//     }
//   } catch (error) {
//     next(error);
//   }
// });
