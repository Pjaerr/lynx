require("dotenv").config();
const express = require("express");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT;

//Setup Database
const db = low(new FileSync("db.json"));

db.defaults({ containers: [] }).write();

//Setup templating engine
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

//Setup express middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/c/:slug", function (req, res) {
  let links = [];

  const container = db
    .get("containers")
    .find({ slug: req.params.slug })
    .value();

  if (container) {
    links = container.links;
  } else {
    db.get("containers").push({ slug: req.params.slug, links }).write();
  }

  res.render("index", {
    slug: req.params.slug,
    links,
  });
});

app.post("/c/:slug/new", (req, res) => {
  const { url } = req.body;

  //Create new entry in DB with 'url';
  const container = db.get("containers").find({ slug: req.params.slug });

  const links = [...container.get("links"), { url }];

  db.get("containers")
    .find({ slug: req.params.slug })
    .set("links", links)
    .write();

  res.redirect(`/c/${req.params.slug}`);
});

app.post("/c/:slug/remove", (req, res) => {
  const { url } = req.body;

  const container = db.get("containers").find({ slug: req.params.slug });

  const links = [...container.get("links")].filter((link) => link.url !== url);

  db.get("containers")
    .find({ slug: req.params.slug })
    .set("links", links)
    .write();

  res.redirect(`/c/${req.params.slug}`);
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
