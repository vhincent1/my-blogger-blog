import { notFound } from '../middleware/errorhandler.middleware.ts';

function isAuthenticated(req, res, next) {
  const enabled = false
  if (!enabled) {
    next()
  } else {
    if (req.session.user) {
      console.log('req user');
      next();
    } else {
      console.log('error, not logged in' + req.session.user);
      req.session.error = 'Access denied!';
      // res.redirect('/login');
      // res.status(404).send('Error')
      notFound(req, res, next);
    }
  }
}

async function postLogin(req, res) {
  try {
    const { username, password } = req.body;
    console.log('Login ', username, password);
    // In a real application, you would query a database
    if (username === 'user' && password === 'pass') {
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.user = 'hi';
        // Successful login: set up session, redirect
        res.redirect('/login/restricted');
      });
    } else {
      console.log('Content type: ' + Object.keys(req.headers));
      console.log(res.get('content-type'));
      res.format({
        'text/html': () => res.status(401).render('login', { errorMessage: 'Invalid username or password' }),
        'application/json': () => res.json({ message: 'not logged in' }),
        default: () => res.status(406).send('Not Acceptable'),
      });
      console.log('invalid ');
      // res.status(401).send('error')
    }
  } catch (err) {
    console.log('ERROR: ' + err);
    res.status(404).send('error');
  }
}

const authController = { isAuthenticated, postLogin };

export default authController;
