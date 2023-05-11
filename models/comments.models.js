const db = require("./../db/connection.js");

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query(
      `
    SELECT comment_id, votes, created_at, author, body, article_id
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;
    `,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "No comments has been found.",
        });
      }
      return result.rows;
    });
};
