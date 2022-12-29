var mongoose = require('mongoose');
var Competition = require('./models/competition.js');
var League = require('./models/league.js');
var Team = require('./models/team.js');
var db;

function connect(callback){
	mongoose.connect('mongodb+srv://scoresdb:sc0res@standings.sw9pe.mongodb.net/standings?retryWrites=true&w=majority');
	db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function() {
  		callback(true);
	});
}

function getLeague(league_id, ){
	League.findOne({'league_id': league_id}, function(err, league){
		return league;
	});
}

function getLeagues(competition_id, callback){
	League.find({'competition_id': competition_id}, function(err, leagues){
		if(err){
			callback(err);
		}
		callback(null, leagues);
	});
}

function getTeams(league_id, callback){
	Team.find({'league_id': league_id}, function(err, teams){
        if (err){
            callback(err);
        }
        //return the results of the competition
        callback(null, teams);
    }).sort('league_pos');  
}

function getCompetitions(callback){
	Competition.find(function(err, competition){
		if(err){
			callback(err);
		}
		callback(null, competition);
	}).sort({year:-1});
}

function getCompetitionByYear(year, callback){
	Competition.findOne({'year': year}, function(err, competition){
		callback(competition);
	});
}

function getTeam(name, league_id, callback){
	Team.findOne({'name': name, 'league_id': league_id}, function(err, db_team){
		var team;
		if(db_team){
			team = db_team;
		} else {
			team = new Team();
		}
		callback(team);
	});
}

function saveCompetition(year, num_leagues, callback){
	var competition = new Competition();
	competition.set({
		year : year,
		num_leagues : num_leagues
	})
	competition.save(function (err, db_competition) {
		if (err) return err;
		else callback(db_competition);
    });

}

function saveLeague(name, id, competition_id, callback){
	var league = new League();
	league.set({
		name : name,
		league_id : id,
		competition_id : competition_id
	});
	league.save(function (err, db_league) {
		if (err) return err;
		else callback(db_league);
    });
}

function saveTeam(team, league_id, team_info, stats, home_stats, away_stats){
	team.set({
		league_id : league_id,
		name : team_info.name,
		league_pos : team_info.league_pos,
		games : team_info.games,
		wins : team_info.wins,
		draws : team_info.draws,
		losses : team_info.losses,
		results_link: team_info.results_link,
		form : stats.form,
		avg_goals_last_5: stats.avg_goals_last_5,
		home_games: team_info.home_games,
 		home_wins: team_info.home_wins,
		home_draws: team_info.home_draws,
		home_losses: team_info.home_losses,
		home_wins_plus_2: home_stats.win_plus_2,
		home_wins_plus_3: home_stats.win_plus_3,
		home_wins_minus_5: home_stats.win_minus_5,
		home_results_link: team_info.home_results_link,
		home_form: home_stats.form,
		away_games: team_info.away_games,
 		away_wins: team_info.away_wins,
		away_draws: team_info.away_draws,
		away_losses: team_info.away_losses,
		away_wins_plus_2: away_stats.win_plus_2,
		away_wins_plus_3: away_stats.win_plus_3,
		away_wins_minus_5: away_stats.win_minus_5,
		away_results_link: team_info.away_results_link,
		away_form: away_stats.form
	});
    team.save(function (err, db_team) {
		if (err) console.log(err);
		else console.log('Saved ' + db_team.name);
	});
}

module.exports.connect = connect;
module.exports.getLeague = getLeague;
module.exports.getLeagues = getLeagues;
module.exports.getTeams = getTeams;
module.exports.getTeam = getTeam;
module.exports.getCompetitionByYear = getCompetitionByYear;
module.exports.getCompetitions = getCompetitions;
module.exports.saveCompetition = saveCompetition;
module.exports.saveLeague = saveLeague;
module.exports.saveTeam = saveTeam;

