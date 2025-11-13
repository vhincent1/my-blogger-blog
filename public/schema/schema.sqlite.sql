-- SQLite doesn't have a direct equivalent to 'CREATE DATABASE IF NOT EXISTS'.
-- The database file is created when you first connect to it.
-- USE simpblog; -- Not needed in SQLite; connection is to a specific file.

-- Table for storing user information
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    password_hash VARCHAR(255),
    -- FirstName VARCHAR(50),
    -- LastName VARCHAR(50),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Note: In SQLite, you cannot use NOW() for default values in the same way as MySQL.
-- CURRENT_TIMESTAMP is standard SQL and works for default values.
-- For an INSERT statement, CURRENT_TIMESTAMP will also work for the current time.
INSERT INTO users (user_id, username, email, password_hash, registration_date, is_admin)
VALUES (1, 'host', '', '', CURRENT_TIMESTAMP, 1); -- BOOLEAN TRUE is 1 in SQLite
INSERT INTO users (user_id, username, email, password_hash, registration_date, is_admin)
VALUES (2, 'VHINCENT', '', '', CURRENT_TIMESTAMP, 1); -- BOOLEAN TRUE is 1 in SQLite


-- Table for storing blog post categories (currently commented out in original)
-- CREATE TABLE Categories (
--     CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
--     CategoryName VARCHAR(50) NOT NULL UNIQUE
-- );

-- Table for storing blog posts
CREATE TABLE posts (
    post_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Referenced foreign key should be INTEGER
    -- CategoryID INTEGER,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- LONGTEXT in MySQL is typically TEXT in SQLite
    labels VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- SQLite doesn't have ON UPDATE CURRENT_TIMESTAMP directly
    is_published BOOLEAN DEFAULT TRUE,
    source VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    -- FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Note on `updated_at`:
-- SQLite does not have a direct equivalent to `ON UPDATE CURRENT_TIMESTAMP`.
-- You typically handle this with triggers in SQLite. Here's how you'd add a trigger for `posts`:
CREATE TRIGGER update_posts_updated_at
AFTER UPDATE ON posts
FOR EACH ROW
BEGIN
    UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE post_id = OLD.post_id;
END;


-- Table for storing comments on blog posts (currently commented out in original)
-- CREATE TABLE Comments (
--     CommentID INTEGER PRIMARY KEY AUTOINCREMENT,
--     PostID INTEGER NOT NULL,
--     UserID INTEGER NOT NULL,
--     CommentText TEXT NOT NULL,
--     CommentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (PostID) REFERENCES Posts(PostID),
--     FOREIGN KEY (UserID) REFERENCES Users(UserID)
-- );

-- Table for storing tags associated with posts (many-to-many relationship) (currently commented out in original)
-- CREATE TABLE Tags (
--     TagID INTEGER PRIMARY KEY AUTOINCREMENT,
--     TagName VARCHAR(50) NOT NULL UNIQUE
-- );

-- Junction table for linking posts to tags (currently commented out in original)
-- CREATE TABLE PostTags (
--     PostID INTEGER NOT NULL,
--     TagID INTEGER NOT NULL,
--     PRIMARY KEY (PostID, TagID),
--     FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE,
--     FOREIGN KEY (TagID) REFERENCES Tags(TagID) ON DELETE CASCADE
-- );

-- Inbox table
CREATE TABLE inbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP is aliased to DATETIME
    -- FOREIGN KEY (id) - This foreign key definition is incomplete and likely incorrect.
    -- If it's meant to reference another table, it needs a REFERENCES clause.
    -- For now, I'm commenting it out as it's malformed.
    -- If 'id' is meant to be a foreign key to a 'users' table or similar, it should be named differently
    -- (e.g., user_id) and explicitly reference the 'users' table.
    -- Let's assume it's meant to be a primary key, which it already is.
    -- If you intended to link it to a user, it should look like:
    -- user_id INTEGER,
    -- FOREIGN KEY (user_id) REFERENCES users(user_id)
);