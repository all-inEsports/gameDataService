const mongoose = require("mongoose");
const fetch = require("node-fetch");
const GameData = require("./model/GameData");


const games = {LOL:"lol",CSGO:"csgo",DOTA2:"dota2"};
Object.freeze(games);

let getAll = async (game,page=1) =>{
  try{
    console.log(game+page);
    let res = await (
      await fetch(
        `https://api.pandascore.co/${game}/matches/upcoming?page=${page}&per_page=100&token=mHD8iOcLA_ckaPAEU9SLB1-6TqEfGKNgC85AkSWm-caYC50H4No`
      )
    ).json();
    console.log(game + " " +res.length);
        if(res.length >= 100)
        {
          res.concat(await getAll(game,page+1));
        }
        return res;
  }catch(e){

  }
}

let getLOLUpcomingMatches = async () => {
  try {
    let res = await getAll(games.LOL)
    await Promise.all(
      res.map((data) => {
        return new Promise(async (resolve) => {
          try {
            data.game = games.LOL;
            await GameData.findOneAndDelete({ id: [data.id] });
            const add = new GameData(data);
            await add.save();
            resolve(obj);
          } catch (e) {
            //console.log(e);
            resolve(e);
          }
        });
      })
    );
  } catch (e) {
    console.log(e);
  }
};

let getDOTA2UpcomingMatches = async () => {
  try {
    let res = await getAll(games.DOTA2)
    await Promise.all(
      res.map((data) => {
        return new Promise(async (resolve) => {
          try {
            data.game = games.DOTA2;
            await GameData.findOneAndDelete({ id: [data.id] });
            const add = new GameData(data);
            await add.save();
            resolve(obj);
          } catch (e) {
            //console.log(e);
            resolve(e);
          }
        });
      })
    );
  } catch (e) {
    console.log(e);
  }
};

let getCSGOUpcomingMatches = async () => {
  try {
    let res = await getAll(games.CSGO)
    await Promise.all(
      res.map((data) => {
        return new Promise(async (resolve) => {
          try {
            data.game = games.CSGO;
            await GameData.findOneAndDelete({ id: [data.id] });
            const add = new GameData(data);
            await add.save();
            resolve(obj);
          } catch (e) {
            //console.log(e);
            resolve(e);
          }
        });
      })
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = (mongoDBConnectionString) => {
  return {
    // Connection to db and defines match model
    connect: () => {
      return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        db.on("error", (err) => {
          reject(err);
        });

        db.once("open", () => {
          resolve();
        });
      });
    },

    getAllMatches: (game,page, perPage) => {
      return new Promise((resolve, reject) => {
        if (+page && +perPage) {
          let filter = {game};

          page = +page - 1;
          GameData.find(filter)
            .sort({ Balance: -1 })
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
      return new Promise((resolve,reject)=>{
        GameData.find({},"")
      })

    },
    getLOLUpcomingMatches,
    getCSGOUpcomingMatches,
    getDOTA2UpcomingMatches
  };
};
