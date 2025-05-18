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


describe("GET /api/users", () => {
  test("200: Responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });

  test("200: Each user has the correct properties and data types", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        
        users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });

  test("200: Response includes expected user data", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        
        const expectedUser = {
          username: "butter_bridge",
          name: "jonny",
          avatar_url: "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        };
        
        expect(users).toEqual(
          expect.arrayContaining([
            expect.objectContaining(expectedUser)
          ])
        );
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


// describe("GET /api/articles", () => {
//   test("200: Responds with an array of article objects", () => {
//     return request(app)
//       .get("/api/articles")
//       .expect(200)
//       .then(({ body }) => {
//         const { articles } = body;
//         expect(Array.isArray(articles)).toBe(true);
//         expect(articles.length).toBeGreaterThan(0);
//         articles.forEach((article) => {
//           expect(article).toMatchObject({
//             article_id: expect.any(Number),
//             title: expect.any(String),
//             topic: expect.any(String),
//             author: expect.any(String),
//             created_at: expect.any(String),
//             votes: expect.any(Number),
//             article_img_url: expect.any(String),
//             comment_count: expect.any(Number),
//           });
//           expect(article).not.toHaveProperty("body");
//         });     
//       });
//   });

//   test("200: Articles are sorted by created_at in descending order", () => {
//     return request(app)
//       .get("/api/articles")
//       .expect(200)
//       .then(({ body }) => {
//         const { articles } = body;
//         expect(articles).toBeSortedBy("created_at", { descending: true });
//       });
//   });

//   test("404: Responds with an error when the path is not found", () => {
//     return request(app)
//       .get("/api/articlez")
//       .expect(404)
//       .then(({ body }) => {
//         expect(body.msg).toBe("Route not found");
//       });
//   });
// });


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


describe("PATCH /api/articles/:article_id", () => {
  test("200: Updates the votes on an article and returns the updated article", () => {
    const voteUpdate = { inc_votes: 1 };
    
    return request(app)
      .patch("/api/articles/1")
      .send(voteUpdate)
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
          votes: 101, 
          article_img_url: expect.any(String)
        });
      });
  });
  
  test("200: Works with negative vote increments", () => {
    const voteUpdate = { inc_votes: -10 };
    
    return request(app)
      .patch("/api/articles/1")
      .send(voteUpdate)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        
        expect(article.votes).toBe(90);
      });
  });
  
  test("400: Responds with an error when inc_votes is missing", () => {
    const invalidUpdate = {};
    
    return request(app)
      .patch("/api/articles/1")
      .send(invalidUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request: missing inc_votes");
      });
  });
  
  test("400: Responds with an error when inc_votes is not a number", () => {
    const invalidUpdate = { inc_votes: "not a number" };
    
    return request(app)
      .patch("/api/articles/1")
      .send(invalidUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request: inc_votes must be a number");
      });
  });
  
  test("404: Responds with an error when article does not exist", () => {
    const voteUpdate = { inc_votes: 1 };
    
    return request(app)
      .patch("/api/articles/999")
      .send(voteUpdate)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found for ID: 999");
      });
  });
  
  test("400: Responds with an error when article_id is not a number", () => {
    const voteUpdate = { inc_votes: 1 };
    
    return request(app)
      .patch("/api/articles/not-an-id")
      .send(voteUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Deletes the specified comment and responds with no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {

        expect(body).toEqual({});
        
        return db.query("SELECT * FROM comments WHERE comment_id = 1");
      })
      .then(({ rows }) => {
        expect(rows).toHaveLength(0);
      });
  });

  test("404: Responds with an error when comment does not exist", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found for ID: 999");
      });
  });

  test("400: Responds with an error when comment_id is not a number", () => {
    return request(app)
      .delete("/api/comments/not-a-comment")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles (sorting queries)", () => {
  test("200: Default sorting is by created_at in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("200: Can sort by any valid column in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("title", { ascending: true });
      });
  });

  test("200: Can sort by any valid column in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=desc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });

  test("200: Can sort by comment_count", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=desc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("comment_count", { descending: true, coerce: true });
      });
  });

  test("200: Works with sort_by parameter only", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });

  test("200: Works with order parameter only", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });

  test("400: Responds with an error for invalid sort_by parameter", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid sort_by parameter: invalid_column");
      });
  });

  test("400: Responds with an error for invalid order parameter", () => {
    return request(app)
      .get("/api/articles?order=invalid_order")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid order parameter: invalid_order");
      });
  });
});

describe("GET /api/articles (topic query)", () => {
  test("200: Returns all articles when no topic is specified", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBeGreaterThan(1);
        // Articles should have different topics
        const topics = [...new Set(articles.map(article => article.topic))];
        expect(topics.length).toBeGreaterThan(1);
      });
  });

  test("200: Returns only articles with the specified topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach(article => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("200: Returns an empty array for a topic that exists but has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });

  test("404: Returns an error for a non-existent topic", () => {
    return request(app)
      .get("/api/articles?topic=nonexistent")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic not found: nonexistent");
      });
  });

  test("200: Works with topic and sorting parameters together", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach(article => {
          expect(article.topic).toBe("mitch");
        });
        expect(articles).toBeSortedBy("title", { ascending: true });
      });
  });
});