const cors = require("cors");
const express = require("express");
const { errorHandler } = require("./errors/errors.js");
const { getTopics } = require("./controllers/topics.controllers.js");
const { getAllEndpoints } = require("./controllers/endpoints.controllers.js");
const {
  getArticleById,
  getAllArticles,
  patchArticleVotesById,
} = require("./controllers/articles.controllers.js");
const {
  getCommentsByArticleId,
  postComment,
  deleteCommentById,
} = require("./controllers/comments.controllers.js");
const { getAllUsers } = require("./controllers/users.controllers.js");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getAllEndpoints);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleVotesById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/api/users", getAllUsers);

app.use(errorHandler);

module.exports = app;
