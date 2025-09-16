CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    user_id INT NOT NULL,
    value INT DEFAULT 1, -- 1 for like, -1 for dislike
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (item_id, user_id) -- Ensures a user can only like/dislike an item once
);