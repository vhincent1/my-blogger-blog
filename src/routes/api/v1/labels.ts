import express from 'express';

import PostService from '../../../services/post.service.ts';

const router = express.Router();
const childRouter = express.Router({ mergeParams: true });
router.use('/', childRouter, async (req, res) => {
  // const { search, type, exclude, filter}: any = req.query
  // const PostParameters: PostParameters = { search, type, filter, exclude }
  const serviceResponse = await PostService.getSortedLabels(req.query);
  return res.send(serviceResponse);
});

childRouter.use('/:author', async (req, res) => {
  const { author }: any = req.params;
  const serviceResponse = await PostService.getSortedLabels(author);
  return res.send(serviceResponse);
});

export default router;
