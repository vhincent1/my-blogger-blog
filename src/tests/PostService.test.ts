import * as chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);

import server from '../app.ts'

import { describe } from 'mocha';
import express, { type Express } from 'express'

import PostService from "../services/post.service.ts";
// import Post from "../model/Post.model.ts"; 

describe("Post Service", () => {

  // Before/After hooks (optional)
  beforeEach(() => {
    // Clear database or reset state before each test
  });

  afterEach(() => {
    // Clean up after each test
  });

  let app: Express
  before(() => {
    app = express()
    app.get("/error", () => {
      throw new Error("Test error");
    });
  })

  const PostServiceInstance = PostService;
  describe("Create instance of service", () => {
    it("Is not null", () => {
      chai.assert.isNotNull(PostServiceInstance);
    });
    it("Exposes the createPost method", () => {
      chai.assert.isFunction(PostServiceInstance.create);
    });
  });

  // Write individual tests using 'it'
  it('should GET all the books', (done) => {
    chai.request(server)
      .get('/api/v1/posts')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0); // Or expected length
        done();
      });
  });
});