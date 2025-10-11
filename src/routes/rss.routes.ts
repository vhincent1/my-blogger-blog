import express from 'express';

import RSS from 'rss'

const app = express.Router();

app.get('/generate-feed', (req, res) => {
    const feed = new RSS({
        title: 'My Awesome Blog',
        description: 'Latest posts from my blog.',
        feed_url: 'http://localhost:3000/generate-feed',
        site_url: 'http://localhost:3000',
        image_url: 'http://localhost:3000/logo.png',
        language: 'en',
        pubDate: new Date(),
    });

    // Add items to the feed (e.g., from a database or static data)
    feed.item({
        title: 'First Post',
        description: 'This is the content of my first post.',
        url: 'http://localhost:3000/posts/first-post',
        guid: 'first-post-id', // Unique identifier for the item
        date: new Date(),
    });

    feed.item({
        title: 'Second Post',
        description: 'More great content in the second post.',
        url: 'http://localhost:3000/posts/second-post',
        guid: 'second-post-id',
        date: new Date(),
    });

    res.set('Content-Type', 'application/xml');
    res.send(feed.xml());
});

export default app