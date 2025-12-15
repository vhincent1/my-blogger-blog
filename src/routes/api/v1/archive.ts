import express from "express";

import PostService from '../../../services/post.service.ts'

const router = express.Router()

const archive = express.Router({ mergeParams: true });
router.use('/', archive, async (req, res) => {
  const { search, type, exclude, filter }: any = req.query;
  const serviceResponse = await PostService.getArchive({ search, type, exclude, filter, meta: { source: 'api/v1/archive' } });
  res.send(serviceResponse);
});

const archiveYearly = express.Router({ mergeParams: true });
archive.use('/:year', archiveYearly, async (req, res) => {
  const { search, type }: any = req.query;
  const serviceResponse = await PostService.getPostCountByYear({ search, type });
  console.log('year');
  res.send(serviceResponse);
});

archiveYearly.use('/:month', async (req, res) => {
  console.log('month');
  res.send('month');
});

export default router