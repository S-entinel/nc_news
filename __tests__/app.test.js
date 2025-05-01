const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */

const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const request = require ("supertest")
const app = require("../app");


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