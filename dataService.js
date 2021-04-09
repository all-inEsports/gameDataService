const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const fetch = require("node-fetch");
const GameData = require("./model/GameData");
const date = require("date-and-time");
const bet = require("./controller/Bet");


const games = { LOL: "lol", CSGO: "csgo", DOTA2: "dota2" };
Object.freeze(games);

let getAll = async (game, page = 1) => {
  try {
    console.log(game + page);
    const now = new Date();
    const dateNow = date.format(now, 'YYYY-MM-DD');
    const dateNowPlus7 = date.format(new Date(now.setDate(now.getDate() + 7)), 'YYYY-MM-DD');
    let URL = `https://api.pandascore.co/${game}/matches/upcoming?range[begin_at]=${dateNow},${dateNowPlus7}&page=${page}&per_page=100&token=mHD8iOcLA_ckaPAEU9SLB1-6TqEfGKNgC85AkSWm-caYC50H4No`;
    console.log(URL + "wow");
    let res = await (
      await fetch(URL)
    ).json();
    console.log(game + " " + res.length);
    if (res.length >= 100) {
      res.concat(await getAll(game, page + 1));
    }
    return res;

  } catch (e) {
    console.log(e);
  }
}
let getResults = async (game, page = 1) => {
  try {
    console.log(game + page);
    const now = new Date();
    const dateNow = date.format(now, 'YYYY-MM-DD');
    const dateNowMinus7 = date.format(new Date(now.setDate(now.getDate() - 7)), 'YYYY-MM-DD');
    let URL = `https://api.pandascore.co/${game}/matches/past?range[begin_at]=${dateNowMinus7},${dateNow}&page=${page}&per_page=100&token=mHD8iOcLA_ckaPAEU9SLB1-6TqEfGKNgC85AkSWm-caYC50H4No`;
    console.log(URL + "wow");
    let res = await (
      await fetch(URL)
    ).json();
    console.log(game + " " + res.length);
    if (res.length >= 100) {
      res.concat(await getResults(game, page + 1));
    }
    return res;

  } catch (e) {
    console.log(e);
  }
}
let getGames = async (gameName, isUpcoming) => {
  try {
    console.log(`get ${gameName} games`);
    let res = isUpcoming ? await getAll(gameName) : await getResults(gameName);
    console.log(typeof res);
    if(!res)
    {
      res = [];
    }
    await Promise.all(
      res.map((data) => {
        return new Promise(async (resolve) => {
          try {
            data.game = gameName;

            if (!isUpcoming & data.winner != null) {
              let gameDocument = await GameData.findOneAndUpdate({ id: data.id }, { $set: data });
              let bets = gameDocument ? await bet.getBetsById(gameDocument._id) : null;

              if (bets) {
                let winners =  bets.filter(data=> data.TeamId == gameDocument.winner_id[0]);
                let winnerMultiple = winners.length > 0 ? bets.map(data => data.Amount).reduce((a,b)=>a+b) / winners.map(data => data.Amount).reduce((a,b)=>a+b) : 0;
                Promise.all(bets.map(betToResolve => {
                  if (betToResolve.TeamId == gameDocument.winner_id[0] && !betToResolve.IsInProgress) {
                    betToResolve.IsWin = true;
                    betToResolve.AmountWon = betToResolve.Amount * winnerMultiple;
                  }
                  bet.resolveBets(betToResolve._id, betToResolve)
                }));
              }
            }
            
              let add = new GameData(data);
              await add.save();
            
            resolve(data);
          } catch (e) {
            console.log(e);
            resolve(e);
          }
        });
      })
    );
  }
  catch (e) {
    console.log(e);
  }
}
module.exports = (mongoDBConnectionString) => {
  return {
    // Connection to db and defines match model
    connect: () => {
      return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false
        });

        db.on("error", (err) => {
          reject(err);
        });

        db.once("open", () => {
          resolve();
        });
      });
    },

    getAllMatches: (game, page, perPage,dateAfter) => {
      return new Promise((resolve, reject) => {
        if (+page && +perPage) {

          let filter = game ? { game } : {};
          filter.begin_at = dateAfter ? {$gte : dateAfter.toString()} : undefined;

          console.log(filter);

          page = +page - 1;
          GameData.find(filter)
            .skip(page * +perPage)
            .limit(+perPage)
            .exec()
            .then((matchs) => {
              resolve(matchs);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject("page and perPage query parameters must be present");
        }
      });
    },
    getMatchById: function (id) {
      return new Promise((resolve, reject) => {
        GameData.findOne({ _id: id })
          .exec()
          .then((match) => {
            resolve(match);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    updateMatchById: function (data, id) {
      return new Promise((resolve, reject) => {
        GameData.updateOne(
          { _id: id },
          {
            $set: data,
          }
        )
          .exec()
          .then(() => {
            resolve(`match ${id} successfully updated`);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    deleteMatchById: function (id) {
      return new Promise((resolve, reject) => {
        GameData.deleteOne({ _id: id })
          .exec()
          .then(() => {
            resolve(`match ${id} successfully deleted`);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    getGames: () => {
      return new Promise((resolve, reject) => {
        GameData.find({}, "")
      })

    },
    getGames,
    games
  };
};
