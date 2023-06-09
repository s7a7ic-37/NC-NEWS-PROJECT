const request = require("supertest");
const app = require("./../app.js");
const testData = require("./../db/data/test-data/index.js");
const seed = require("./../db/seeds/seed.js");
const db = require("./../db/connection.js");
const endpointsJSON = require("./../endpoints.json");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

describe("/api/topics", () => {
  it("GET status:200, responds with an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        const topicsArray = res.body.topics;
        expect(topicsArray.length).toBe(3);
        topicsArray.forEach((topic) => {
          const { slug, description } = topic;
          expect(typeof slug).toBe("string");
          expect(typeof description).toBe("string");
        });
      });
  });
  it("GET status:404, responds with an error when provided endpoint that does not exist", () => {
    return request(app).get("/api/news").expect(404);
  });
});

describe("/api", () => {
  it("GET status:200, responds with an object representing all available endpoints of the api", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .then((res) => {
        const endpointsObject = res.body;
        expect(endpointsObject).toEqual(endpointsJSON);
      });
  });
});

describe("/api/articles/:article_id", () => {
  it("GET status:200, responds with an article object by ID provided", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        expect(article.article_id).toBe(3);
        expect(article.title).toBe("Eight pug gifs that remind me of mitch");
        expect(article.topic).toBe("mitch");
        expect(article.author).toBe("icellusedkars");
        expect(article.body).toBe("some gifs");
        expect(article.created_at).toBe("2020-11-03T09:12:00.000Z");
        expect(article.votes).toBe(0);
        expect(article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  it("GET status: 400, returns error message when received invalid id", () => {
    return request(app)
      .get("/api/articles/article_3")
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Bad request.");
      });
  });
  it("GET status: 404, returns error message when received unavailable id", () => {
    return request(app)
      .get("/api/articles/998")
      .expect(404)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("No articles has been found.");
      });
  });
  it("PATCH status:200, responds with an updated article for the given article id", () => {
    const testInput = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/3")
      .send(testInput)
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        const {
          article_id,
          title,
          topic,
          author,
          body,
          created_at,
          votes,
          article_img_url,
        } = article;
        expect(article_id).toBe(3);
        expect(title).toBe("Eight pug gifs that remind me of mitch");
        expect(topic).toBe("mitch");
        expect(author).toBe("icellusedkars");
        expect(body).toBe("some gifs");
        expect(created_at).toBe("2020-11-03T09:12:00.000Z");
        expect(votes).toBe(10);
        expect(article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  it("PATCH status:200, should skip properties other than 'inc_votes' in input object", () => {
    const testInput = { inc_votes: 20, property: ";DROP TABLE articles;" };
    return request(app)
      .patch("/api/articles/3")
      .send(testInput)
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        const {
          article_id,
          title,
          topic,
          author,
          body,
          created_at,
          votes,
          article_img_url,
        } = article;
        expect(article_id).toBe(3);
        expect(title).toBe("Eight pug gifs that remind me of mitch");
        expect(topic).toBe("mitch");
        expect(author).toBe("icellusedkars");
        expect(body).toBe("some gifs");
        expect(created_at).toBe("2020-11-03T09:12:00.000Z");
        expect(votes).toBe(20);
        expect(article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  it("PATCH status:200, works for negative votes property", () => {
    const testInput = { inc_votes: -15 };
    return request(app)
      .patch("/api/articles/3")
      .send(testInput)
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        const { votes } = article;
        expect(votes).toBe(-15);
      });
  });
  it("PATCH status:400, returns error message when received invalid votes value", () => {
    const testInput = { inc_votes: "1" };
    return request(app)
      .patch("/api/articles/3")
      .send(testInput)
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Bad request.");
      });
  });
  it("PATCH status: 400, returns error message when received invalid id", () => {
    const testInput = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/article_3")
      .send(testInput)
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Bad request.");
      });
  });
  it("PATCH status: 404, returns error message when received unavailable id", () => {
    const testInput = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/998")
      .send(testInput)
      .expect(404)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe(
          "No articles has been found with id of 998"
        );
      });
  });
});

describe("/api/articles", () => {
  it("GET status:200, responds with an array of all article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const articlesArray = res.body.articles;
        expect(articlesArray.length).toBe(testData.articleData.length);
        articlesArray.forEach((article) => {
          const {
            author,
            title,
            article_id,
            topic,
            created_at,
            votes,
            article_img_url,
            comment_count,
          } = article;
          expect(typeof author).toBe("string");
          expect(typeof title).toBe("string");
          expect(typeof article_id).toBe("number");
          expect(typeof topic).toBe("string");
          expect(typeof created_at).toBe("string");
          expect(typeof votes).toBe("number");
          expect(typeof article_img_url).toBe("string");
          expect(typeof comment_count).toBe("number");
        });
      });
  });
  it("GET status:200, sorts results by 'created_at' date in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const articlesArray = res.body.articles;
        expect(articlesArray).toBeSorted({
          descending: true,
          key: "created_at",
        });
      });
  });
  it("GET status:200, filters articles by the topic value specifies in the query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((res) => {
        const articlesArray = res.body.articles;
        const mitchArticles = testData.articleData.filter(
          (article) => article.topic === "mitch"
        );
        expect(articlesArray.length).toBe(mitchArticles.length);
        articlesArray.forEach((article) => {
          const {
            author,
            title,
            article_id,
            topic,
            created_at,
            votes,
            article_img_url,
            comment_count,
          } = article;
          expect(typeof author).toBe("string");
          expect(typeof title).toBe("string");
          expect(typeof article_id).toBe("number");
          expect(topic).toBe("mitch");
          expect(typeof created_at).toBe("string");
          expect(typeof votes).toBe("number");
          expect(typeof article_img_url).toBe("string");
          expect(typeof comment_count).toBe("number");
        });
      });
  });
  it("GET status:200, returns an empty array when no article has been found with the existing topic value", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((res) => {
        const articlesArray = res.body.articles;
        expect(articlesArray.length).toBe(0);
      });
  });
  it("GET status:400, returns error message when received invalid 'topic' query", () => {
    return request(app)
      .get("/api/articles?topic=pluto")
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe(
          "No articles has been found with selected topic"
        );
      });
  });
  describe("GET status: 200, sorts articles by any valid column", () => {
    const validColumns = [
      { sortBy: "title", expected: "title" },
      { sortBy: "topic", expected: "topic" },
      { sortBy: "author", expected: "author" },
      { sortBy: "created_at", expected: "created_at" },
      { sortBy: "votes", expected: "votes" },
      { sortBy: "comment_count", expected: "comment_count" },
    ];

    validColumns.forEach(({ sortBy, expected }) => {
      it(`GET status: 200, sorts articles by ${sortBy}`, () => {
        return request(app)
          .get(`/api/articles?sort_by=${sortBy}`)
          .expect(200)
          .then((res) => {
            const articlesArray = res.body.articles;
            expect(articlesArray.length).toBe(testData.articleData.length);
            expect(articlesArray).toBeSorted({
              descending: true,
              key: expected,
            });
          });
      });
    });
  });
  it("GET status:400, returns error message when received invalid 'sort_by' query", () => {
    return request(app)
      .get("/api/articles?sort_by=sun")
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Bad 'sort_by' query");
      });
  });
  it("GET status:200, sorts by query in descending order", () => {
    return request(app)
      .get("/api/articles?order=desc")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSorted({
          descending: true,
        });
      });
  });
  it("GET status:200, sorts by query in ascending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((res) => {
        const articles = res.body.articles;
        expect(articles).toBeSorted({
          ascending: true,
        });
      });
  });
  it("GET status:400, returns error message when received invalid 'order' query", () => {
    return request(app)
      .get("/api/articles?order=sun")
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Bad 'order' query");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  it("GET status:200, responds with an array of comments objects for the given article ID", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const commentsArray = res.body.comments;
        expect(commentsArray.length).toBe(11);
        commentsArray.forEach((comment) => {
          const { comment_id, votes, created_at, author, body, article_id } =
            comment;
          expect(typeof comment_id).toBe("number");
          expect(typeof votes).toBe("number");
          expect(typeof created_at).toBe("string");
          expect(typeof author).toBe("string");
          expect(typeof body).toBe("string");
          expect(article_id).toBe(1);
        });
      });
  });
  it("GET status:200, sorts comments by 'created_at' date in descending order by default", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const commentsArray = res.body.comments;
        expect(commentsArray).toBeSorted({
          descending: true,
          key: "created_at",
        });
      });
  });
  it("GET status:200, responds with an empty array if no comments are found for the correct article ID", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((res) => {
        const commentsArray = res.body.comments;
        expect(commentsArray).toEqual([]);
      });
  });
  it("GET status: 400, returns error message when received invalid id", () => {
    return request(app)
      .get("/api/articles/invalid-id/comments")
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Bad request.");
      });
  });
  it("GET status: 404, returns error message when received unavailable id", () => {
    return request(app)
      .get("/api/articles/998/comments")
      .expect(404)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe(
          "No articles has been found with id of 998"
        );
      });
  });
  it("POST status:201, should add and return posted comment", () => {
    const testComment = {
      username: "rogersop",
      body: "I'm the Sultan of Sentiment!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(201)
      .then((res) => {
        const comment = res.body.comment[0];
        const { comment_id, body, votes, author, article_id, created_at } =
          comment;

        const currentDate = new Date().toISOString();
        const createdTimestamp = Date.parse(created_at);
        const currentTimestamp = Date.parse(currentDate);

        expect(comment_id).toBe(19);
        expect(body).toBe("I'm the Sultan of Sentiment!");
        expect(article_id).toBe(1);
        expect(author).toBe("rogersop");
        expect(votes).toBe(0);
        expect(createdTimestamp - currentTimestamp).toBeLessThanOrEqual(100);
      });
  });
  it("POST status:201, should skip properties other than username or body in posted comment object", () => {
    const testComment = {
      username: "rogersop",
      body: "123",
      votes: ";DROP TABLE comments;",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(201)
      .then((res) => {
        const comment = res.body.comment[0];
        const { comment_id, body, votes, author, article_id, created_at } =
          comment;

        const currentDate = new Date().toISOString();
        const createdTimestamp = Date.parse(created_at);
        const currentTimestamp = Date.parse(currentDate);

        expect(comment_id).toBe(19);
        expect(body).toBe("123");
        expect(article_id).toBe(1);
        expect(author).toBe("rogersop");
        expect(votes).toBe(0);
        expect(createdTimestamp - currentTimestamp).toBeLessThanOrEqual(100);
      });
  });
  it("POST status:400, responds with error message when provided invalid article id", () => {
    const testComment = {
      username: "rogersop",
      body: "I'm the Sultan of Sentiment!",
    };
    return request(app)
      .post("/api/articles/wrong-id/comments")
      .send(testComment)
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Bad request.");
      });
  });
  it("POST status:404, responds with error message when provided unavailable article id", () => {
    const testComment = {
      username: "rogersop",
      body: "I'm the Sultan of Sentiment!",
    };
    const articleId = 997;
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(testComment)
      .expect(404)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe(
          `No articles has been found with id of ${articleId}`
        );
      });
  });
  it("POST status:404, responds with error message when passed invalid username", () => {
    const testComment = {
      username: "username123",
      body: "I'm the Sultan of Sentiment!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(404)
      .then((res) => {
        const testUsername = testComment.username;
        const responseMessage = res.body.message;
        expect(responseMessage).toBe(
          "User with provided username is not found"
        );
      });
  });
  it("POST status:400, responds with error message when passed an empty body", () => {
    const testComment = {
      username: "rogersop",
      body: "",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Your comment cannot be empty!");
      });
  });
});

describe("/api/comments/:comment_id", () => {
  it("DELETE status:204, removes the comment by comment id provided", () => {
    return request(app).delete("/api/comments/5").expect(204);
  });
  it("DELETE status: 400, returns error message when received invalid comment id", () => {
    return request(app)
      .delete("/api/comments/article_3")
      .expect(400)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe("Bad request.");
      });
  });
  it("DELETE status: 404, returns error message when received unavailable comment id", () => {
    return request(app)
      .delete("/api/comments/998")
      .expect(404)
      .then((res) => {
        const responseMessage = res.body.message;
        expect(responseMessage).toBe(
          "No comments has been found with id of 998"
        );
      });
  });
});

describe("/api/users", () => {
  it("GET status:200, responds with an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((res) => {
        const usersArray = res.body.users;
        expect(usersArray.length).toBe(4);
        usersArray.forEach((user) => {
          const { username, name, avatar_url } = user;
          expect(typeof username).toBe("string");
          expect(typeof name).toBe("string");
          expect(typeof avatar_url).toBe("string");
        });
      });
  });
});
