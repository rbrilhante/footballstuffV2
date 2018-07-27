var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeagueSchema = new Schema({
 league_id: Number,
 competition_id: String,
 name: String,
 match_day: Number
 //teams: [{type: Schema.ObjectId, ref: 'Team'}]
});

module.exports = mongoose.model('League', LeagueSchema);