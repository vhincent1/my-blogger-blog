INSERT OR REPLACE INTO posts VALUES (1, 1, 'title', 'content', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, NULL)

DROP FROM posts

SELECT * FROM posts LIMIT 100

SELECT count(*) as count from posts

-- check if table exists
SELECT name FROM sqlite_master WHERE type='table' AND name='posts'

-- join example
SELECT users.username, posts.user_id, posts.id as postId, posts.title FROM users INNER JOIN posts ON users.id = posts.user_id 

-- Get username from a post
SELECT 
    post.user_id, 
    user.username, 
    post.title
FROM 
    posts AS post
INNER JOIN 
    users AS user 
ON post.user_id = user.id WHERE post.id = 1 LIMIT 1