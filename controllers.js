const { getDefaultAutoSelectFamilyAttemptTimeout } = require("net");
const db = require("./db/connection");
const {fetchTopics, fetchArticleById, fetchArticles, 
  fetchCommentsById,addCommentToArticle, updateArticleVotes, removeCommentById} = require("./models")

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
        res.status(200).send({ article })
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

exports.getCommentsById = (req, res, next) => {
  const {article_id: articleId} = req.params
  fetchCommentsById(articleId).then(
    (comments) => {
      res.status(200).send({ comments })
    }
  ).catch(next);
}

exports.postCommentToArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  
  if (!username || !body) {
    return next({
      status: 400,
      msg: "Bad request: missing required fields"
    });
  }
  
  addCommentToArticle(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  
  if (inc_votes === undefined) {
    return next({
      status: 400,
      msg: "Bad request: missing inc_votes"
    });
  }
  
  if (typeof inc_votes !== 'number') {
    return next({
      status: 400,
      msg: "Bad request: inc_votes must be a number"
    });
  }
  
  updateArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  removeCommentById(comment_id).then(() => {
      res.status(204).send()
    }
  ).catch(next);
};