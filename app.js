const express = require("express");
const app = express();
const endpointsJson = require("./endpoints.json");

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Welcome to the API! Visit /api for documentation" });
});

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints: endpointsJson });
});

module.exports = app;