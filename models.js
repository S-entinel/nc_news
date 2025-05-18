const db = require("./db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT slug, description, img_url FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleById = (articleId) => {
    return db
      .query(
        `SELECT * FROM articles WHERE article_id = $1;`,
        [articleId]
      )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: `Article not found for ID: ${articleId}`,
          });
        }
        return rows[0];
      });
  };

  exports.fetchArticles = () => {
    return db
      .query(
        `SELECT 
          articles.article_id,
          articles.title,
          articles.topic,
          articles.author,
          articles.created_at,
          articles.votes,
          articles.article_img_url,
          COUNT(comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;`,
      )
      .then(({ rows }) => {
        return rows;
      });
  };

  exports.fetchCommentsById = (articleId) => {
    return db
      .query(
        `SELECT 
          comment_id,
          votes,
          created_at,
          author,
          body,
          article_id
        FROM comments WHERE article_id = $1
        ORDER BY created_at DESC;`,
        [articleId]
      )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return db
            .query('SELECT * FROM articles WHERE article_id = $1', [articleId])
            .then(({ rows: articleRows }) => {
              if (articleRows.length === 0) {
                return Promise.reject({
                  status: 404,
                  msg: `Article not found for ID: ${articleId}`,
                });
              }
              return [];
            });
        }
        return rows;
      });

  }


  exports.addCommentToArticle = (article_id, username, body) => {

    return db
      .query('SELECT title FROM articles WHERE article_id = $1', [article_id])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: `Article not found for ID: ${article_id}`,
          });
        }
                
        return db
          .query('SELECT * FROM users WHERE username = $1', [username])
          .then(({ rows: userRows }) => {
            if (userRows.length === 0) {
              return Promise.reject({
                status: 404,
                msg: `User not found: ${username}`,
              });
            }
            
            return db
              .query(
                `INSERT INTO comments 
                  (article_id, author, body, votes, created_at) 
                VALUES 
                  ($1, $2, $3, 0, NOW()) 
                RETURNING comment_id, author, body, votes, created_at;`,
                [article_id, username, body]
              )
              .then(({ rows: commentRows }) => {
                console.log(commentRows[0])
                return {
                  ...commentRows[0],
                  article_id: Number(article_id)
                };
              });
          });
      });
  };

  exports.updateArticleVotes = (article_id, inc_votes) => {
    return db
      .query(
        `UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;`,
        [inc_votes, article_id]
      )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: `Article not found for ID: ${article_id}`,
          });
        }
        return rows[0];
      });
  };

  exports.removeCommentById = (comment_id) => {
    return db
      .query(
        `DELETE FROM comments WHERE comment_id = $1 RETURNING *;`,
        [comment_id]
      )
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({
            status: 404,
            msg: `Comment not found for ID: ${comment_id}`,
          });
        }
        return rows[0];
      });
  };