import express from 'express';
import { getPaginationParameters, getPaginatedData } from '../../../controller/pagination.controller.ts';
import { Post } from '../../../model/Post.model.ts';

import { postService } from '../../../services/index.service.ts';
import { ServiceResponse } from '../../../model/ServiceResponse.model.ts';
import { StatusCodes } from 'http-status-codes';

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
    const serviceResponse = await postService.getPosts({ search, type, filter, exclude, meta: { source: 'api/v1/posts' } });
    if (serviceResponse.success) {
      const posts: any = await serviceResponse.responseObject;
      // ----------------------------------
      const paginationParams = getPaginationParameters(req, {
        page: page || 1,
        limit: limit || 5,
      });
      const paginatedItems = await getPaginatedData(paginationParams, posts);

      if (paginatedItems.totalCount === 0) {
        return res.send(ServiceResponse.failure('No posts found', req.query, null, StatusCodes.NOT_FOUND));
      } else if (paginatedItems.currentPage > paginatedItems.totalPages /*exceeds limit*/ || paginatedItems.currentPage < 0 /*is negative*/) {
        return res.send(ServiceResponse.failure('Page limit exceeded', req.query, null, StatusCodes.NOT_FOUND));
      }
      res.send(ServiceResponse.success<any>('Posts found', req.query, paginatedItems));
    } else {
      res.send(serviceResponse);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
  const t1 = performance.now();
  console.log(`Fetch request took ${t1 - t0} milliseconds.`);
});

router.use('/average', async (req, res) => {
  const serviceResponse = await postService.getPosts();
  const posts: any = await serviceResponse.responseObject;

  function getAverageTimeOfDay(dateArray) {
    if (!Array.isArray(dateArray) || dateArray.length === 0) return null; // Handle empty or invalid input
    let totalMilliseconds = 0;
    for (const date of dateArray) {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date object encountered in array:', date);
        continue; // Skip invalid date objects
      }
      // Get milliseconds since midnight for each date
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const milliseconds = date.getMilliseconds();
      const timeInMilliseconds = hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds;
      totalMilliseconds += timeInMilliseconds;
    }
    if (dateArray.length === 0) return null; // All dates were invalid or array became empty after filtering
    const averageMilliseconds = totalMilliseconds / dateArray.length;
    // Convert the average milliseconds back into a time string or Date object
    // Create a base date (e.g., January 1, 2000) and add the average time
    const baseDate = new Date(2000, 0, 1); // Year, Month (0-indexed), Day
    baseDate.setTime(baseDate.getTime() + averageMilliseconds);
    // Format the time as desired (e.g., HH:MM:SS)
    const averageHours = baseDate.getHours().toString().padStart(2, '0');
    const averageMinutes = baseDate.getMinutes().toString().padStart(2, '0');
    const averageSeconds = baseDate.getSeconds().toString().padStart(2, '0');
    return `${averageHours}:${averageMinutes}:${averageSeconds}`;
  }
  const timestamps = posts.map((post) => {
    // Assuming the date property is named 'createdAt'
    const date = new Date(post.date.published);
    return date;
  });
  const averageTimeOfDay = getAverageTimeOfDay(timestamps);
  // 6. Return the result
  res.json({
    averageTimeOfDay,
    // averagePostDate: averageDate.toISOString(),
    // rawTimestamp: averageTimestamp,
    // time: formattedTime
  });
});

// import PDFDocument from 'pdfkit';

// router.get('/generate-pdfkit', async (req, res) => {
//   // const serviceResponse = await postService.getPosts();
//   // const posts: any = await serviceResponse.responseObject;

//   const doc = new PDFDocument();

//   // Set the response headers
//   res.writeHead(200, {
//     'Content-Type': 'application/pdf',
//     // 'Content-Disposition': 'attachment; filename="sample.pdf"' // Forces download
//   });

//   // Pipe the PDF document to the response stream
//   doc.pipe(res);

//   // Add content to the document
//   doc.image()
//   doc.fontSize(25).text('<b>Hello</b> from Express & PDFKit!', 100, 100);
//   doc.text('This is a dynamically generated PDF file.', { align: 'center' });

//   // Finalize the document
//   doc.end();
// });

export default router;
