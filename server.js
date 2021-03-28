require("dotenv").config();
console.log(process.env.URI);
const express = require("express");
const cron = require("node-cron");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const data = require("./dataService")(process.env.URI);
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/ps/games", async (req, res) => {
  let page = req.query.page || 1;
  let perPage = req.query.perPage || 10;
  let game = req.query.game;
  data
    .getAllMatches(game,page, perPage)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: `an error occurred: ${err}` });
    });
});

app.get("/ps/games/:id", (req, res) => {
  data
    .getMatchById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: `an error occurred: ${err}` });
    });
});

cron.schedule("1 * * * * *", () => {
  console.log("running every 4-5");
  data.getLOLUpcomingMatches();
});

cron.schedule("1 * * * *", () => {
  console.log("running every 4-5");
  data.getCSGOUpcomingMatches();
});

cron.schedule("1 * * * *", () => {
  console.log("running every 4-5");
  data.getDOTA2UpcomingMatches();
});
data
  .connect()
  .then(() => {
    app.listen(port, () => {
      console.log("API listening on: " + port);
    });
  })
  .catch((err) => {
    console.log("unable to start the server: " + err);
    process.exit();
  });
