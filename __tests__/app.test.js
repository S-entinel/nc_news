const endpointsJson = require("../endpoints.json");
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const request = require ("supertest")
const app = require("../app");
require('jest-sorted');


beforeEach (() => {
    return seed(data);
    });

 afterAll(()  => {
    return db.end();
 });


describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});


describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBeGreaterThan(0);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
          expect(topic).toHaveProperty("img_url");
        });
        
        expect(topics).toEqual(expect.arrayContaining([
          expect.objectContaining({ 
            slug: 'mitch', 
            description: 'The man, the Mitch, the legend',
            img_url: expect.any(String)
          }),
          expect.objectContaining({ 
            slug: 'cats', 
            description: 'Not dogs',
            img_url: expect.any(String)
          }),
          expect.objectContaining({ 
            slug: 'paper', 
            description: 'what books are made of',
            img_url: expect.any(String)
          })
        ]));
      });
  });

  test("404: Responds with an error when the path is not found", () => {
    return request(app)
      .get("/api/topicz")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});


describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article object with the correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });

  test("404: Responds with an error when article does not exist", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found for ID: 999");
      });
  });

  test("400: Responds with an error when article_id is not a number", () => {
    return request(app)
      .get("/api/articles/not-an-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});



describe("GET /api/articles", () => {
  test("200: Responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        console.log(articles)
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(article).not.toHaveProperty("body");
        });     
      });
  });

  test("200: Articles are sorted by created_at in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("404: Responds with an error when the path is not found", () => {
    return request(app)
      .get("/api/articlez")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});


describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBeGreaterThan(0);
        
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1
          });
        });
      });
  });

  test("200: Comments are served with the most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("200: Responds with an empty array for an article with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments).toHaveLength(0);
      });
  });

  test("404: Responds with an error when article does not exist", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found for ID: 999");
      });
  });

  test("400: Responds with an error when article_id is not a number", () => {
    return request(app)
      .get("/api/articles/not-an-id/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Adds a comment to an article and responds with the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a test comment"
    };
    
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          author: "butter_bridge",
          body: "This is a test comment",
          votes: 0,
          created_at: expect.any(String),
          article_id: 1
        });
      });
  });

  test("400: Responds with an error when request body is missing required fields", () => {
    // Missing username
    const invalidComment1 = {
      body: "This is a test comment"
    };
    
    const promise1 = request(app)
      .post("/api/articles/1/comments")
      .send(invalidComment1)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request: missing required fields");
      });
    
    const invalidComment2 = {
      username: "butter_bridge"
    };
    
    const promise2 = request(app)
      .post("/api/articles/1/comments")
      .send(invalidComment2)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request: missing required fields");
      });
    
    const invalidComment3 = {};
    
    const promise3 = request(app)
      .post("/api/articles/1/comments")
      .send(invalidComment3)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request: missing required fields");
      });
    
    return Promise.all([promise1, promise2, promise3]);
  });

  test("404: Responds with an error when article does not exist", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a test comment"
    };
    
    return request(app)
      .post("/api/articles/999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found for ID: 999");
      });
  });

  test("404: Responds with an error when username does not exist", () => {
    const newComment = {
      username: "non_existent_user",
      body: "This is a test comment"
    };
    
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found: non_existent_user");
      });
  });

  test("400: Responds with an error when article_id is not a number", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a test comment"
    };
    
    return request(app)
      .post("/api/articles/not-an-id/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});