var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
 league_id: Number,
 name: String,
 league_pos: Number,
 games: Number,
 points: Number,
 wins: Number,
 losses: Number,
 draws: Number,
 goals_scored: Number,
 goals_against: Number,
 form_link: String,
 form: Array
});

module.exports = mongoose.model('Team', TeamSchema);