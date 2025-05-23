const express = require("express");
const app = express();
const endpointsJson = require("./endpoints.json");
const { getTopics, getUsers, getArticleById, getCommentsById, postCommentToArticle,
  patchArticleVotes, deleteCommentById, getAllArticles
 } = require("./controllers");
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./errors");

const cors = require('cors');

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Welcome to the API! Visit /api for documentation" });
});

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

// app.get("/api/articles", getArticles);

app.get("/api/users", getUsers);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsById);

app.post("/api/articles/:article_id/comments", postCommentToArticle);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", deleteCommentById)

app.get("/api/articles", getAllArticles);



app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);


module.exports = app;