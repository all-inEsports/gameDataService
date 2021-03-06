const mongoose = require("mongoose");
const fetch = require("node-fetch");
const GameData = require("./model/GameData");

let getAllUpcomingMatches = async () => {
  try {
    let res = await (
      await fetch(
        "https://api.pandascore.co/lol/matches/upcoming?token=mHD8iOcLA_ckaPAEU9SLB1-6TqEfGKNgC85AkSWm-caYC50H4No"
      )
    ).json();

    await Promise.all(
      res.map((data) => {
        return new Promise(async (resolve) => {
          try {
            await GameData.findOneAndDelete({ id: data.id });
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

    getAllMatches: (page, perPage) => {
      return new Promise((resolve, reject) => {
        if (+page && +perPage) {
          let filter = {};

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
    getAllUpcomingMatches,
  };
};
