const db = require("../connection")
const format = require("pg-format");
const { convertTimestampToDate } = require('./utils')


const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query(
    `DROP TABLE IF EXISTS comments;`
  )
  .then(() => {
  return db.query(
    `DROP TABLE IF EXISTS articles;`
  )})
  .then(() => {
    return db.query(
      `DROP TABLE IF EXISTS users;`
    )
  })
  .then(() => {
    return db.query(
      `DROP TABLE IF EXISTS topics;`
    )
  })
  .then(() => {
    return db.query(
      `CREATE TABLE topics (
       slug VARCHAR PRIMARY KEY NOT NULL,
       description VARCHAR NOT NULL,
       img_url VARCHAR(1000)
      );`
    )
  })
  .then(() => {
    return db.query(
      `CREATE TABLE users (
       username VARCHAR PRIMARY KEY NOT NULL,
       name VARCHAR NOT NULL,
       avatar_url VARCHAR(1000)
      );`
    )
  })
  .then(() => {
    return db.query(
      `CREATE TABLE articles (
       article_id SERIAL PRIMARY KEY,
       title VARCHAR NOT NULL,
       topic VARCHAR NOT NULL REFERENCES topics(slug) ON DELETE CASCADE,
       author VARCHAR NOT NULL REFERENCES users(username) ON DELETE CASCADE,
       body TEXT NOT NULL,
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       votes INT NOT NULL DEFAULT 0,
       article_img_url VARCHAR(1000)
      );`
    )
  })
  .then(() => {
    return db.query(
      `CREATE TABLE comments (
       comment_id SERIAL PRIMARY KEY,
       article_id INT NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
       body TEXT NOT NULL,
       votes INT NOT NULL DEFAULT 0,
       author VARCHAR NOT NULL REFERENCES users(username) ON DELETE CASCADE,
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`
    )
  })
  .then(() => {
    const topicsInsertStr = format(
      `INSERT INTO topics
        (slug, description, img_url)
      VALUES
        %L`
    , topicData.map(({ slug, description, img_url })=> {
        return [slug, description, img_url]
    }))
    return db.query(topicsInsertStr)
  })
  .then(() => {
    const usersInsertStr = format(
      `INSERT INTO users
        (username, name, avatar_url)
      VALUES
        %L`
    , userData.map(({ username, name, avatar_url })=> {
        return [username, name, avatar_url]
    }))
    return db.query(usersInsertStr)
  })
  .then(() => {
    const reformatedArticleData = articleData.map((article) => {
      return convertTimestampToDate(article)
    })


    const articlesInsertStr = format(
      `INSERT INTO articles
        (title, topic, author, body, created_at, votes, article_img_url)
      VALUES
        %L
        RETURNING *`
    , reformatedArticleData.map(({ title, topic, author, body, created_at, votes, article_img_url })=> {
        return [title, topic, author, body, created_at, votes, article_img_url]
    }))
    return db.query(articlesInsertStr)
  })
  .then((newArticleData) => {
    const reformatedCommentsData = commentData.map((comment) => {
      return convertTimestampToDate(comment)
    })

    const titleToArticleID = {}
    newArticleData.rows.forEach((article) => {
      titleToArticleID[article.title] = article.article_id;
    })


    const commentsInsertStr = format(
      `INSERT INTO comments
        (article_id, body, votes, author, created_at)
      VALUES
        %L`
    , reformatedCommentsData.map(({ article_title, body, votes, author, created_at })=> {
        return [titleToArticleID[article_title], body, votes, author, created_at]
    }))
    return db.query(commentsInsertStr)
  })

  ;
};
module.exports = seed;

