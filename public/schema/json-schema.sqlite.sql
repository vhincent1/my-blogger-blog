-- auto-generated JSON Schema for posts table
DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  data JSON
);
-- Add column user_id
ALTER TABLE posts
ADD COLUMN user_id INTEGER
GENERATED ALWAYS AS (json_extract(data, '$.user_id')) VIRTUAL;
-- Add column title
ALTER TABLE posts
ADD COLUMN title TEXT
GENERATED ALWAYS AS (json_extract(data, '$.title')) VIRTUAL;
-- Add column content
ALTER TABLE posts
ADD COLUMN content TEXT
GENERATED ALWAYS AS (json_extract(data, '$.content')) VIRTUAL;
-- Add column labels
ALTER TABLE posts
ADD COLUMN labels TEXT
GENERATED ALWAYS AS (json_extract(data, '$.labels')) VIRTUAL;
-- Add column created_at
ALTER TABLE posts
ADD COLUMN created_at DATE
GENERATED ALWAYS AS (json_extract(data, '$.created_at')) VIRTUAL;
-- Add column updated_at
ALTER TABLE posts
ADD COLUMN updated_at DATE
GENERATED ALWAYS AS (json_extract(data, '$.updated_at')) VIRTUAL;
-- Add column category
ALTER TABLE posts
ADD COLUMN category INTEGER
GENERATED ALWAYS AS (json_extract(data, '$.category')) VIRTUAL;
-- Add column source
ALTER TABLE posts
ADD COLUMN source TEXT
GENERATED ALWAYS AS (json_extract(data, '$.source')) VIRTUAL;
-- Add column status
ALTER TABLE posts
ADD COLUMN status INTEGER
GENERATED ALWAYS AS (json_extract(data, '$.status')) VIRTUAL;

-- Create indexes
CREATE INDEX idx_posts_id ON posts (id);
CREATE INDEX idx_posts_user_id ON posts (user_id);
CREATE INDEX idx_posts_title ON posts (title);
CREATE INDEX idx_posts_content ON posts (content);
CREATE INDEX idx_posts_labels ON posts (labels);
CREATE INDEX idx_posts_created_at ON posts (created_at);
CREATE INDEX idx_posts_updated_at ON posts (updated_at);
CREATE INDEX idx_posts_category ON posts (category);
CREATE INDEX idx_posts_source ON posts (source);
CREATE INDEX idx_posts_status ON posts (status);
--- end of schema


-- UPDATE posts
-- SET data = json_replace(data, '$.user_id', 1150)
-- WHERE id = 1;