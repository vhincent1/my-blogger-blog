-- Active: 1762931794703@@127.0.0.1@3306
-- SQLite doesn't have a direct equivalent to 'CREATE DATABASE IF NOT EXISTS'.
-- The database file is created when you first connect to it.
-- USE simpblog; -- Not needed in SQLite; connection is to a specific file.
-- Table for storing user information
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255),
    email VARCHAR(100),
    -- FirstName VARCHAR(50),
    -- LastName VARCHAR(50),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    role INTEGER DEFAULT 0
);

-- Note: In SQLite, you cannot use NOW() for default values in the same way as MySQL.
-- CURRENT_TIMESTAMP is standard SQL and works for default values.
-- For an INSERT statement, CURRENT_TIMESTAMP will also work for the current time.
INSERT INTO
    users (
        id,
        username,
        password,
        email,
        registration_date,
        role
    )
VALUES
    (1, 'host', '', '', CURRENT_TIMESTAMP, 1);

-- BOOLEAN TRUE is 1 in SQLite
INSERT INTO
    users (
        id,
        username,
        password,
        email,
        registration_date,
        role
    )
VALUES
    (2, 'VHINCENT', '', '', CURRENT_TIMESTAMP, 1);

-- BOOLEAN TRUE is 1 in SQLite
-- Table for storing blog post categories (currently commented out in original)
-- CREATE TABLE Categories (
--     CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
--     CategoryName VARCHAR(50) NOT NULL UNIQUE
-- );
-- Table for storing blog posts
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    -- Referenced foreign key should be INTEGER
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    -- LONGTEXT in MySQL is typically TEXT in SQLite
    labels VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- SQLite doesn't have ON UPDATE CURRENT_TIMESTAMP directly
    source VARCHAR(255),
    status BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users (id) -- FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

CREATE TABLE media (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    images TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
)

 -- Note on `updated_at`:
-- SQLite does not have a direct equivalent to `ON UPDATE CURRENT_TIMESTAMP`.
-- You typically handle this with triggers in SQLite. Here's how you'd add a trigger for `posts`:
-- CREATE TRIGGER update_posts_updated_at
-- AFTER UPDATE ON posts
-- FOR EACH ROW
-- BEGIN
--     UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE post_id = OLD.post_id;
-- END;
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
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- TIMESTAMP is aliased to DATETIME
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