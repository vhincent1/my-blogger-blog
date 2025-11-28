import express from 'express';
import { getPaginationParameters, getPaginatedData } from '../../../controller/pagination.controller.ts';
import { Post } from '../../../model/Post.model.ts';
import PostService from '../../../services/post.service.ts';
import { ServiceResponse } from '../../../model/ServiceResponse.model.ts';

const router = express.Router();

router.use('/format', async (req, res) => {
  const placeholder = new Post(0);
  placeholder.title = 'Title';
  placeholder.content = 'Hi';
  placeholder.labels = ['label1', 'label2'];
  placeholder.date = {
    published: new Date(),
    updated: new Date(),
  }; //as PostDate
  placeholder.author = 'Author';
  res.status(200).json(placeholder);
});

// 
router.use('/', async (req, res) => {
  const t0 = performance.now(); //timer
  const { page, limit, search, type, filter, exclude }: any = req.query;
  try {
    const serviceResponse = await PostService.getPosts({ search, type, filter, exclude, meta: { source: 'api/v1/posts' } });
    if (serviceResponse.success) {
      const posts: any = await serviceResponse.responseObject;
      // ----------------------------------
      const paginationParams = getPaginationParameters(req, {
        page: page || 1,
        limit: limit || 5,
      });
      const paginatedItems = await getPaginatedData(paginationParams, posts);
      if (paginatedItems.currentPage > paginatedItems.totalPages /*exceeds limit*/ || paginatedItems.currentPage < 0 /*is negative*/) return res.send(ServiceResponse.failure('Page limit exceeded', req.query, null, 404));
      res.send(ServiceResponse.success<any>('Posts found', req.query, paginatedItems));
    } else {
      res.send(serviceResponse);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items' });
  }
  const t1 = performance.now();
  console.log(`Fetch request took ${t1 - t0} milliseconds.`);
});


export default router;
