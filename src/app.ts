import 'dotenv/config';
import path from 'path';
// color text
import chalk from 'chalk';
// express
import express from 'express';
import session from 'express-session';
import compress from 'compression';
import { xss } from 'express-xss-sanitizer';
import cookieParser from 'cookie-parser';
import cors from 'cors';
//routes
import routes from './routes/app.routes.ts';
//middleware
import * as middlewares from './middleware/errorhandler.middleware.ts';
import { handleShutdown } from './middleware/shutdown.middleware.ts';
import expressStatusMonitorMiddleware from './middleware/express-status-monitor.middleware.ts';

const app = express();
const port = process.env.PORT;
const __dirname = path.resolve();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
// Serve static files (CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/content')));

app.use(compress());
app.use(express.json()); // for parsing application/json
app.use(xss()); // Apply XSS sanitizer to all incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Enable CORS for all routes (for development purposes, or if you want to allow all origins)
app.use(cors());
app.use(expressStatusMonitorMiddleware);

// Or, configure CORS to allow specific origins:
// app.use(cors({
//   origin: 'http://localhost:3000' // Replace with your frontend's origin
// }));

// const getClientIp = (req: Request): string | undefined => {
//   // Check for the X-Forwarded-For header, which is commonly set by proxies
//   const forwarded = req.headers['x-forwarded-for'];

//   if (forwarded) {
//     // If it exists, the IP is the first value in the comma-separated list
//     // (the client's original IP)
//     return (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])?.trim();
//   }

//   // Fallback to req.ip or req.socket.remoteAddress if no proxy is involved
//   return req.ip || req.socket.remoteAddress;
// };

// sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);

// log ip addresses
app.use((req, res, next) => {
  //let clientIp = req.socket.remoteAddress
  // Get the remote IP address
  let remoteIp = req.ip || req.connection.remoteAddress; // Use req.ip if trust proxy is enabled
  // Store the IP address in the session if it's not already there
  const session: any = req.session
  if (!session.remoteAddress) {
    session.remoteAddress = remoteIp;
  }
  // You can also update it on subsequent requests if needed,
  // for example, to track changes in IP address (e.g., mobile network changes)
  // req.session.lastKnownRemoteAddress = remoteIp;
  console.log(req.method, remoteIp, req.originalUrl);
  next();
});

app.use('/', routes);
// app.use(function(req, res, next) {
//   res.status(404);
//   // respond with html page
//   if (req.accepts('html')) {
//     res.render('404', { url: req.url });
//     return;
//   }
//   // respond with json
//   if (req.accepts('json')) {
//     res.json({ error: 'Not found' });
//     return;
//   }
//   // default to plain-text. send()
//   res.type('txt').send('Not found');
// });

// 404 Not Found Middleware (ALWAYS keep this as the last route/middleware)
// app.use((req, res, next) => {
// respond with html page
// if (req.accepts("html")) {
//   res.render("error", { url: req.url });
//   return;
// }
// // respond with json
// if (req.accepts("json")) {
//   res.json({ error: "Not found" });
//   return;
// }
// // default to plain-text. send()
// res.type("txt").send("Not found");
// res.status(404).send("Sorry, the page you're looking for cannot be found!");
// res.format({
//   html: function () {
//     // res.render("404", { url: req.url });
//     res.status(404);
//     res.send("Sorry, the page you're looking for cannot be found!");
//   },
//   json: function () {
//     res.json({ error: "Not found" });
//   },
//   default: function () {
//     res.type("txt").send("Not found");
//   },
// });
// return handleError(req,res, next)
// });
app.use(middlewares.notFound);
// the error handler is placed after routes
// if it were above it would not receive errors
// from app.get() etc
app.use(middlewares.errorHandler);

const server = app.listen(port, () => {
  // const addressInfo = server.address();
  // const host = addressInfo.address === '::' ? 'localhost' : addressInfo.address; // Handle IPv6 '::' for localhost
  // const port = addressInfo.port;

  /* eslint-disable no-console */
  // console.log(`${chalk.bgYellow.black('Listening:')} ` + chalk.bgBlue.white(`http://localhost:${port}`));
  console.log(`${chalk.bgBlue.white(`Listening: http://localhost:${port}`)}`);

  // const memoryUsage = process.memoryUsage();
  // console.log('Memory Usage:', memoryUsage);
  /* eslint-enable no-console */
});

server.on('error', (err: any) => {
  switch (err.code) {
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use. Please choose another port or stop the process using it.`);
    default:
      console.error('Failed to start server:', err);
      break;
  }
  process.exit(1);
});

process.on('SIGINT', () => handleShutdown(server, 'SIGINT'));
process.on('SIGTERM', () => handleShutdown(server, 'SIGTERM'));
// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err);
//   handleShutdown('uncaughtException'); // Attempt graceful shutdown on unhandled errors
// });
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   handleShutdown('unhandledRejection'); // Attempt graceful shutdown on unhandled promise rejections
// });

export default app;
//# sourceMappingURL=app.js.map
