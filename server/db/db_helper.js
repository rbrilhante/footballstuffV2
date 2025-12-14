var mongoose = require('mongoose');
var Competition = require('./models/competition.js');
var League = require('./models/league.js');
var Team = require('./models/team.js');
var Updates = require('./models/updates.js');
var db;

function connect(callback) {
	mongoose.connect('mongodb+srv://scoresdb:sc0res@standings.sw9pe.mongodb.net/standings');
	db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function () {
		callback(true);
	});
}

async function getLeague(league_id) {
	return await League.findOne({ 'league_id': league_id });
}

async function getLeagues(competition_id) {
	return await League.find({ 'competition_id': competition_id });
}

async function getTeams(league_id) {
	return await Team.find({ 'league_id': league_id }).sort('league_pos');
}

async function deleteTeams(league_id) {
	console.log(await Team.deleteMany({ 'league_id': league_id }));
	console.log(await Team.deleteMany({ 'league_id': null }));
}

async function getCompetitions() {
	return await Competition.find().sort({ year: -1 });
}

async function getCompetitionByYear(year) {
	return await Competition.findOne({ 'year': year })
}

async function getTeam(team_id, league_id) {
	var team = await Team.findOne({ 'team_id': team_id, 'league_id': league_id });
	if (team) {
		return team;
	} else {
		return new Team();
	}
}

async function saveCompetition(year, num_leagues) {
	var competition = new Competition();
	competition.set({
		year: year,
		num_leagues: num_leagues
	})
	return await competition.save();
}

function saveLeague(league_info, competition_id) {
	var league = new League();
	league.set({
		name: league_info.name,
		league_id: league_info.web_id,
		competition_id: competition_id
	});
	league.save();
}

async function saveTeam(team, league_id, team_info, stats) {
	team.set({
		league_id: league_id,
		name: team_info.name,
		team_id: team_info.team_id,
		league_pos: team_info.league_pos,
		games: team_info.games,
		wins: team_info.wins,
		draws: team_info.draws,
		losses: team_info.losses,
		results_link: team_info.results_link,
		form: stats.form,
		avg_goals_last_5: stats.avg_goals_last_5,
		home_games: team_info.home_games,
		home_wins: team_info.home_wins,
		home_draws: team_info.home_draws,
		home_losses: team_info.home_losses,
		home_wins_plus_2: stats.home_wins_plus_2,
		home_wins_plus_3: stats.home_wins_plus_3,
		home_wins_minus_5: stats.home_wins_minus_5,
		home_results_link: team_info.home_results_link,
		away_games: team_info.away_games,
		away_wins: team_info.away_wins,
		away_draws: team_info.away_draws,
		away_losses: team_info.away_losses,
		away_wins_plus_2: stats.away_wins_plus_2,
		away_wins_plus_3: stats.away_wins_plus_3,
		away_wins_minus_5: stats.away_wins_minus_5,
		away_results_link: team_info.away_results_link
	});
	var db_team = await team.save();
	if (db_team) console.log('Saved ' + db_team.name);
}

async function saveTeamPos(team, position) {
	team.set({
		league_pos: position
	});
	if (await team.save()) console.log('Saved ' + team.name + ' postion');
}

async function saveCycle(cycles, updated_teams) {
	var updates = new Updates();
	updates.set({
		date: new Date(),
		cycles: cycles,
		updated_teams: updated_teams
	});
	if (await updates.save()) console.log('Saved a new cycle');
}

module.exports.connect = connect;
module.exports.getLeague = getLeague;
module.exports.getLeagues = getLeagues;
module.exports.getTeams = getTeams;
module.exports.deleteTeams = deleteTeams;
module.exports.getTeam = getTeam;
module.exports.getCompetitionByYear = getCompetitionByYear;
module.exports.getCompetitions = getCompetitions;
module.exports.saveCompetition = saveCompetition;
module.exports.saveLeague = saveLeague;
module.exports.saveTeam = saveTeam;
module.exports.saveTeamPos = saveTeamPos;
module.exports.saveCycle = saveCycle;

