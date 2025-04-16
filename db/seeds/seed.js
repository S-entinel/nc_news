const db = require("../connection")
const format = require("pg-format")
const {
  convertTimestampToDate
} = require("../seeds/utils");



const seed = ({ topicData, userData, articleData, commentData }) => {

  const formattedArticleData = articleData.map(convertTimestampToDate);
  const formattedCommentData = commentData.map(convertTimestampToDate);

  return db
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS articles;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS topics;`);
    })
    // 2. Create tables in correct order
    .then(() => {
      return db.query(`
        CREATE TABLE topics (
          slug VARCHAR PRIMARY KEY NOT NULL,
          description VARCHAR NOT NULL,
          img_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          username VARCHAR PRIMARY KEY NOT NULL,
          name VARCHAR NOT NULL,
          avatar_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          topic VARCHAR NOT NULL REFERENCES topics(slug),
          author VARCHAR NOT NULL REFERENCES users(username),
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          votes INT DEFAULT 0,
          article_img_url VARCHAR (1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
          comment_id SERIAL PRIMARY KEY,
          article_id INT NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          author VARCHAR NOT NULL REFERENCES users(username),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })
    .then(() => {
      const topicInsertStr = format(
        'INSERT INTO topics (slug, description, img_url) VALUES %L;',
        topicData.map(({ slug, description, img_url }) => [slug, description, img_url])
      );
      return db.query(topicInsertStr);
    })
    .then(() => {
      const userInsertStr = format(
        'INSERT INTO users (username, name, avatar_url) VALUES %L;',
        userData.map(({ username, name, avatar_url }) => [username, name, avatar_url])
      );
      return db.query(userInsertStr);
    })
    .then(() => {
      const articleInsertStr = format(
        'INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;',
        formattedArticleData.map(({title, topic, author, body, created_at, votes, article_img_url }) => {
          return [title, topic, author, body, created_at, votes, article_img_url]
        })
      );
      return db.query(articleInsertStr);
    })
    .then((articleInsertResult) => {

      const articleRows = articleInsertResult.rows;
      const articleTitleToId = {};
      
      articleRows.forEach((article) => {
        articleTitleToId[article.title] = article.article_id;
      });

      const commentInsertStr = format(
        'INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L;',
        formattedCommentData.map(({article_title, body, votes, author, created_at }) => [
          articleTitleToId[article_title], 
          body,
          votes,
          author,
          created_at
        ])
      );
      return db.query(commentInsertStr);
    });

};
module.exports = seed;
