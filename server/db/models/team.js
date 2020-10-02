var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
 league_id: Number,
 name: String,
 league_pos: Number,
 games: Number,
 points: Number,
 form_link: String,
 form: Array,
 home_games: Number,
 home_wins: Number,
 home_losses: Number,
 home_draws: Number,
 home_goals_scored: Number,
 home_goals_against: Number,
 home_form_link: String,
 home_form: Array,
 away_games: Number,
 away_wins: Number,
 away_losses: Number,
 away_draws: Number,
 away_goals_scored: Number,
 away_goals_against: Number,
 away_form_link: String,
 away_form: Array,
 avg_goal_win: Number
});

module.exports = mongoose.model('Team', TeamSchema);