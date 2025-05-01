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