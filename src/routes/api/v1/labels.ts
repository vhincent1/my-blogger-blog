import express from 'express';

import {postService} from '../../../services/index.service.ts';

const router = express.Router();
const childRouter = express.Router({ mergeParams: true });
router.use('/', childRouter, async (req, res) => {
  // const { search, type, exclude, filter}: any = req.query
  // const PostParameters: PostParameters = { search, type, filter, exclude }
  const serviceResponse = await postService.getSortedLabels(req.query);
  return res.send(serviceResponse);
});

childRouter.use('/:author', async (req, res) => {
  const { author }: any = req.params;
  const serviceResponse = await postService.getSortedLabels(author);
  return res.send(serviceResponse);
});

export default router;
