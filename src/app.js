import 'dotenv/config';
import path from 'path';
//express
import express from 'express';
import session from 'express-session';
import compress from 'compression';
import cookieParser from 'cookie-parser';
//routes
import routes from './routes/app.routes.js';
//middleware
import * as middlewares from './middleware/errorhandler.middleware.js';
// color text
import chalk from 'chalk';
const app = express();
const port = process.env.PORT;
const __dirname = path.resolve();
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
// Serve static files (CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use(compress());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}));
app.use('/', routes);
app.use((req, res, next) => {
    // Get the remote IP address
    let remoteIp = req.ip || req.connection.remoteAddress; // Use req.ip if trust proxy is enabled
    // Store the IP address in the session if it's not already there
    if (!req.session.remoteAddress) {
        req.session.remoteAddress = remoteIp;
    }
    // You can also update it on subsequent requests if needed,
    // for example, to track changes in IP address (e.g., mobile network changes)
    // req.session.lastKnownRemoteAddress = remoteIp;
    console.log(remoteIp);
    next();
});
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
    /* eslint-disable no-console */
    console.log(`Listening: ` + chalk.bgBlue.white(`http://localhost:${port}`));
    /* eslint-enable no-console */
});
server.on('error', (err) => {
    switch (err.code) {
        case 'EADDRINUSE':
            console.error(`Port ${port} is already in use. Please choose another port or stop the process using it.`);
        default:
            console.error('Failed to start server:', err);
            break;
    }
    process.exit(1);
});
//# sourceMappingURL=app.js.map