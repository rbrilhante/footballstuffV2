var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
 league_id: Number,
 team_id: Number,
 name: String,
 league_pos: Number,
 games: Number,
 wins: Number,
 draws: Number,
 losses: Number,
 results_link: String,
 form: Array,
 avg_goals_last_5: Number,
 home_games: Number,
 home_wins: Number,
 home_draws: Number,
 home_losses: Number,
 home_wins_plus_2: Number,
 home_wins_plus_3: Number,
 home_wins_minus_5: Number,
 home_results_link: String,
 home_form: Array,
 away_games: Number,
 away_wins: Number,
 away_draws: Number,
 away_losses: Number,
 away_wins_plus_2: Number,
 away_wins_plus_3: Number,
 away_wins_minus_5: Number,
 away_results_link: String,
 away_form: Array,
});

module.exports = mongoose.model('Team', TeamSchema);