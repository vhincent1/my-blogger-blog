import { navbarController } from '../controller/navbar.controller.ts';
import { StatusCodes } from 'http-status-codes';

function notFound(req, res, next) {
  res.format({
    html: () => res.render('404', { navbar: navbarController }),
    json: () => res.json({ error: 'Not found' }),
    default: () => res.type('txt').send('Not found'),
  });
}

// error handling middleware have an arity of 4
// instead of the typical (req, res, next),
// otherwise they behave exactly like regular
// middleware, you may have several of them,
// in different orders etc.

function errorHandler(err, req, res, next) {
  // log it
  console.error(err.stack);

  // respond with 500 "Internal Server Error".
  res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  res.send('Internal Server Error');
}

export { notFound, errorHandler };
