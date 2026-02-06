import express from 'express';
const route = express.Router();

import { postService } from '../../../services/index.service.ts';
import { StatusCodes } from 'http-status-codes';
import { ServiceResponse } from '../../../model/ServiceResponse.model.ts';

// 201 Created: The most common and semantically correct code for a successful POST request that results in one or more new resources being created on the server.
// The response should include a Location header pointing to the URI of the new resource.
// 200 OK: Can be used if the POST request succeeded but a more specific code like 201 is not appropriate, and a response body with the result of the action is returned.
// 202 Accepted: Used when the request has been accepted for processing, but the processing is not yet complete (e.g., for batch processing or asynchronous tasks).
// There is no guarantee the action will eventually be fulfilled.
// 204 No Content

// curl -X POST -H "Content-Type: application/json" -d '{"name": "John Doe", "age": 30}' http://localhost:3000/api/v1/heart
// like widget

route.post('/:postId', async (req, res) => {
  console.log('heart post:');
  // postService.
  //   const itemId = req.params.postId;
  //   console.log(itemId);
  console.log(req.body);
  console.log('p:', req.params.postId);
  //   const userId = req.user.id; // Assuming user authentication and req.user is populated
  //   try {
  //     // Check if the user has already liked/disliked this item
  //     const existingLike = await db.query('SELECT * FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
  //     let newLikeCount;
  //     if (existingLike.length > 0) {
  //       // User already liked, so unlike it (or toggle dislike)
  //       await db.query('DELETE FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
  //       newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
  //     } else {
  //       // User has not liked, so add a like
  //       await db.query('INSERT INTO likes (item_id, user_id, value) VALUES (?, ?, 1)', [itemId, userId]);
  //       newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
  //     }
  //     res.json({ message: 'Like status updated', newLikeCount: newLikeCount[0].count });
  //   } catch (error) {
  //     console.error('Database error:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }

  const serviceResponse = await postService.heartPost(1, 1);

  // const serviceResponse = ServiceResponse.success('success', req.params, '');
  res.send(serviceResponse);
  // res.status(StatusCodes.ACCEPTED).json('');
});

export default route;
