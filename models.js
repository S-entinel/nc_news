const db = require("./db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT slug, description, img_url FROM topics;`).then(({ rows }) => {
    return rows;
  });
};