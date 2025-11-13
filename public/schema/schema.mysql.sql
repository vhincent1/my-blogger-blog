-- Active: 1762931794703@@127.0.0.1@3306
CREATE DATABASE IF NOT EXISTS simpblog;
USE simpblog;

-- Table for storing user information
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    -- FirstName VARCHAR(50),
    -- LastName VARCHAR(50),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);
INSERT INTO users VALUES (1, 'host', '', '', NOW(), true)
INSERT INTO users VALUES (2, 'VHINCENT', '', '', NOW(), true)

-- Table for storing blog post categories
-- CREATE TABLE Categories (
--     CategoryID INT PRIMARY KEY AUTO_INCREMENT,
--     CategoryName VARCHAR(50) NOT NULL UNIQUE
-- );

-- Table for storing blog posts
CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    -- CategoryID INT,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    labels VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    source VARCHAR(255)
    -- FOREIGN KEY (user_id) REFERENCES Users(user_id)
    -- FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Table for storing comments on blog posts
-- CREATE TABLE Comments (
--     CommentID INT PRIMARY KEY AUTO_INCREMENT,
--     PostID INT NOT NULL,
--     UserID INT NOT NULL,
--     CommentText TEXT NOT NULL,
--     CommentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (PostID) REFERENCES Posts(PostID),
--     FOREIGN KEY (UserID) REFERENCES Users(UserID)
-- );

-- Table for storing tags associated with posts (many-to-many relationship)
-- CREATE TABLE Tags (
--     TagID INT PRIMARY KEY AUTO_INCREMENT,
--     TagName VARCHAR(50) NOT NULL UNIQUE
-- );

-- Junction table for linking posts to tags
-- CREATE TABLE PostTags (
--     PostID INT NOT NULL,
--     TagID INT NOT NULL,
--     PRIMARY KEY (PostID, TagID),
--     FOREIGN KEY (PostID) REFERENCES Posts(PostID) ON DELETE CASCADE,
--     FOREIGN KEY (TagID) REFERENCES Tags(TagID) ON DELETE CASCADE
-- );

-- Inbox table
CREATE TABLE inbox (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id)
);