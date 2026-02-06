import express from 'express';

import authController from '../../../controller/auth.controller.ts';
import { loginLimiter } from '../../../middleware/limiter.middleware.ts';

const route = express.Router();

// curl -X POST -H "Content-Type: application/json" -H "Accept: application/json" -d '{"username": "user", "password": "pass"}' http://localhost:3000/api/v1/auth
// curl -X GET http://localhost:3000/api/v1/auth/a --header "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJpYXQiOjE3NjY1MTkxODYsImV4cCI6MTc2NjUyMjc4Nn0.GLdZXc4stEQuYq2VrY8Q4rMCGZzTXE1cpoa3SZzbHLk"
route.post('/', loginLimiter, authController.postLogin);

route.post('/test', authController.authenticateToken, (req: any, res) => {
  console.log('test');
  console.log('user:', req.user);
  // res.status(200).send('ok')
  res.format({
    'text/html': () => res.status(200).send({ message: 'text/html' }),
    'application/json': () => res.json({ message: 'json', user: req.user }),
    default: () => res.status(406).send('Not Acceptable'),
  });
});

route.get('/test', authController.isAuthenticated, (req: any, res) => {
  console.log('user:', req.user);
  // res.status(200).send('ok')
  res.format({
    'text/html': () => res.status(401).send('text/html'),
    'application/json': () => res.json({ message: 'json', user: req.user }),
    default: () => res.status(406).send('Not Acceptable'),
  });
});

export default route;
