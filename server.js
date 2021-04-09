require("dotenv").config();
console.log(process.env.URI);
const express = require("express");
const cron = require("node-cron");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const data = require("./dataService")(process.env.URI);
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

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/ps/games", async (req, res) => {
  let page = req.query.page || 1;
  let perPage = req.query.perPage || 10;
  let game = req.query.game;
  let date = req.query.date;
  data
    .getAllMatches(game,page, perPage,date)
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


cron.schedule("*/30 * * * *", () => {
  console.log("running every 30 ");
  data.getGames(data.games.LOL, true);

  data.getGames(data.games.CSGO, true);

  data.getGames(data.games.DOTA2, true);

});

cron.schedule("*/1 * * * *", () => {
  console.log("running every 30 ");

  data.getGames(data.games.LOL, false);

  data.getGames(data.games.CSGO, false);

  data.getGames(data.games.DOTA2, false);
});
