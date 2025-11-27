import express from 'express';

const route = express.Router();


// curl -X POST -H "Content-Type: application/json" -d '{"name": "John Doe", "age": 30}' http://localhost:3000/api/v1/heart
// like widget
route.post('/', async (req, res) => {
  //   const itemId = req.params.postId;
  //   console.log(itemId);
  console.log(req.body);
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
});

export default route;
