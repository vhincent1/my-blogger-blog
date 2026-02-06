--- auto-generated JSON Schema for posts table ---

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  data JSON
);

-- Alter table statements
ALTER TABLE posts ADD COLUMN user_id INTEGER GENERATED ALWAYS AS (json_extract(data, '$.user_id')) VIRTUAL;
ALTER TABLE posts ADD COLUMN title TEXT GENERATED ALWAYS AS (json_extract(data, '$.title')) VIRTUAL;
ALTER TABLE posts ADD COLUMN content TEXT GENERATED ALWAYS AS (json_extract(data, '$.content')) VIRTUAL;
ALTER TABLE posts ADD COLUMN labels TEXT GENERATED ALWAYS AS (json_extract(data, '$.labels')) VIRTUAL;
ALTER TABLE posts ADD COLUMN created_at DATE GENERATED ALWAYS AS (json_extract(data, '$.created_at')) VIRTUAL;
ALTER TABLE posts ADD COLUMN updated_at DATE GENERATED ALWAYS AS (json_extract(data, '$.updated_at')) VIRTUAL;
ALTER TABLE posts ADD COLUMN category INTEGER GENERATED ALWAYS AS (json_extract(data, '$.category')) VIRTUAL;
ALTER TABLE posts ADD COLUMN source TEXT GENERATED ALWAYS AS (json_extract(data, '$.source')) VIRTUAL;
ALTER TABLE posts ADD COLUMN status INTEGER GENERATED ALWAYS AS (json_extract(data, '$.status')) VIRTUAL;

-- Create indexes
CREATE INDEX idx_posts_user_id ON posts (user_id);
CREATE INDEX idx_posts_title ON posts (title);
CREATE INDEX idx_posts_content ON posts (content);
CREATE INDEX idx_posts_labels ON posts (labels);
CREATE INDEX idx_posts_created_at ON posts (created_at);
CREATE INDEX idx_posts_updated_at ON posts (updated_at);
CREATE INDEX idx_posts_category ON posts (category);
CREATE INDEX idx_posts_source ON posts (source);
CREATE INDEX idx_posts_status ON posts (status);
--- end of posts schema ---
--- auto-generated JSON schema for users table ---
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  data JSON
);
-- Alter table statements
ALTER TABLE users ADD COLUMN username TEXT GENERATED ALWAYS AS (json_extract(data, '$.username')) VIRTUAL;
ALTER TABLE users ADD COLUMN password TEXT GENERATED ALWAYS AS (json_extract(data, '$.password')) VIRTUAL;
ALTER TABLE users ADD COLUMN email TEXT GENERATED ALWAYS AS (json_extract(data, '$.email')) VIRTUAL;
ALTER TABLE users ADD COLUMN registration_date TEXT GENERATED ALWAYS AS (json_extract(data, '$.registration_date')) VIRTUAL;
ALTER TABLE users ADD COLUMN role TEXT GENERATED ALWAYS AS (json_extract(data, '$.role')) VIRTUAL;
-- Create indexes
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_password ON users (password);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_registration_date ON users (registration_date);
CREATE INDEX idx_users_role ON users (role);
--- end of schema ---



