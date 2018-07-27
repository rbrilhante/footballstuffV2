var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Competition = require('./models/competition.js');
var League = require('./models/league.js');
var Team = require('./models/team.js');
var db;

function connect(callback){
	mongoose.connect('mongodb://scoresdb:sc0res@ds129321.mlab.com:29321/standings');
	db = mongoose.connection;
	var result;
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
	});
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

function saveTeam(team, league_id, team_info, team_form){
	team.set({
		league_id : league_id,
		name : team_info.name,
		league_pos : team_info.league_pos,
		games : team_info.games,
		points : team_info.points,
	    wins : team_info.wins,
	    losses : team_info.losses,
	    draws : team_info.draws,
	    goals_scored : team_info.goals_scored, 
	    goals_against : team_info.goals_against,
		form : team_form
	});
    team.save(function (err, db_team) {
		if (err) console.log(err);
		else console.log('Saved ' + db_team.name + ' in Mongo with form: ' + db_team.form);
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

