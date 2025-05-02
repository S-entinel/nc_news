const db = require("./db/connection");
const {fetchTopics, fetchArticleById, fetchArticles} = require("./models")

exports.getTopics = (req, res, next) => {
    fetchTopics()
      .then((topics) => {
        res.status(200).send({ topics });
      })
      .catch(next);
  };

exports.getArticleById = (req, res, next) => {
    const {article_id: articleId} = req.params
    fetchArticleById(articleId).then((article) => {
        res.status(200).send({article})
    })
    .catch(next);
}

exports.getArticles = (req, res, next) => {
  fetchArticles()
      .then((articles) => {
        res.status(200).send({ articles });
      })
      .catch(next);
  };