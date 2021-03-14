const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((error) => {
    console.error("Connection to DB Failed");
    console.error(error.message);
    process.exit(-1);
  });
const GameDataSchema = new Schema({
  name: [Object],
  official_stream_url: [Object],
  end_at: [Object],
  draw: [Object],
  league: [Object],
  league_id: [Object],
  detailed_stats: [Object],
  live_embed_url: [Object],
  tournament_id: [Object],
  results: [Object],
  videogame_version: [Object],
  streams: [Object],
  modified_at: [Object],
  games: [Object],
  original_scheduled_at: [Object],
  match_type: [Object],
  scheduled_at: [Object],
  winner: [Object],
  slug: [Object],
  videogame: [Object],
  status: [Object],
  winner_id: [Object],
  forfeit: [Object],
  tournament: [Object],
  rescheduled: [Object],
  id: [Object],
  game_advantage: [Object],
  serie_id: [Object],
  opponents: [Object],
  number_of_games: [Object],
  serie: [Object],
  live: [Object],
  begin_at: [Object],
  game:{
    required:true
  }
});
module.exports = mongoose.connection.model("GameData", GameDataSchema);
