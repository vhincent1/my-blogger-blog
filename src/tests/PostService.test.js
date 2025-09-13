import { assert } from "chai";
import { describe } from "mocha";

import PostService from "../services/post.service.js";
import PostModel from "../model/Post.model.js"; // Import the service we want to test

describe("Post Service", () => {
  const PostServiceInstance = new PostService();
  describe("Create instance of service", () => {
    it("Is not null", () => {
      assert.isNotNull(PostServiceInstance);
    });
    it("Exposes the createPost method", () => {
      assert.isFunction(PostServiceInstance.create);
    });
  });
});