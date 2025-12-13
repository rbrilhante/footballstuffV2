var request = require('request');
var cheerio = require('cheerio');
var axios = require('axios');
var configs;
var league_page;
var team_form_page;

function init(init_configs) {
	configs = init_configs;
}

function loadLeague(web_id, callback) {
	var url = configs.league_page.replace("${league_id}", web_id);
	console.log(url);
	axios.get(url).then((response) => {
		callback(null, response.data.Stages[0]);
	}).catch((error) => {
		callback(error);
	});

	/*var jar = request.jar();

	var options = {
		url: url,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,**;q=0.8',
			'Referer': 'https://google.com/',
		},
		jar: jar,
		followAllRedirects: true,
	}
	request(options, (error, response, body) => {
		if (error) {
			console.error('Error:', error);
			return;
		}

		// Second request with stored cookies
		request(options, function (error, response, html) {
			var conditions = ["Temporariamente Suspenso", "utilizadores registrados", "cookies"];
			if (!error && !conditions.some(el => html.includes(el))) {
				var league_page = cheerio.load(html);
				callback(null, league_page);
			} else {
				if (error) {
					callback(0);
				} else if (html.includes('cookies')) callback(1);
				else if (html.includes('Temporariamente Suspenso')) callback(2);
				else callback(3);
			}
		});
	});*/
}

function loadTeamFormPage(team, league_id, callback) {
	var url = configs.teams_form_base_url.replace("${team_name}", team.name).replace("${team_id}", team.team_id).replace("${league_id}", league_id);
	axios.get(url).then((response) => {
		callback(null, response.data.pageProps.initialData.eventsByMatchType[0].Events);
	}).catch((error) => {
		callback(error);
	});
	/* var jar = request.jar();

	var options = {
		url: team_form_page_url,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,**;q=0.8',
			'Referer': 'https://google.com/',
		},
		jar: jar,
		followAllRedirects: true,
	}
	request(options, (error, response, body) => {
		if (error) {
			console.error('Error:', error);
			return;
		}

		request(options, function (error, response, html) {
			var conditions = ["Temporariamente Suspenso", "utilizadores registrados", "cookies"];
			if (!error && !conditions.some(el => html.includes(el))) {
				var team_form_page = cheerio.load(html);
				callback(null, team_form_page);
			} else {
				if (error) {
					callback(0);
				} else if (html.includes('cookies')) callback(1);
				else if (html.includes('Temporariamente Suspenso')) callback(2);
				else callback(3);
			}
		});
	}) */
}

function getTeams(league_page) {
	return league_page('#' + configs.table_id + ' tbody tr');
}

function getTeamInfo(team) {
	return {
		'league_pos': team.rnk, 'name': team.Tnm, 'team_id': team.Tid,
		'games': team.pld, 'wins': team.win, 'draws': team.drw, 'losses': team.lst
	};
}

function getTeamStats(team_form, team_name) {
	var form = [];
	var home_wins_plus_2 = 0;
	var home_wins_plus_3 = 0;
	var home_wins_minus_5 = 0;
	var away_wins_plus_2 = 0;
	var away_wins_plus_3 = 0;
	var away_wins_minus_5 = 0;
	var total_goals = 0;

	for (index = team_form.length - 1; index >= 0; index--) {
		var homeGoals = parseInt(team_form[index].Tr1);
		var awayGoals = parseInt(team_form[index].Tr2);
		var isHome = team_form[index].T1[0].Nm === team_name;

		var result = 'E'
		if (homeGoals > awayGoals) {
			isHome ? result = 'V' : result = 'D';
		} else if (homeGoals < awayGoals) {
			isHome ? result = 'D' : result = 'V';
		}

		var goals = homeGoals + awayGoals;
		if (isNaN(goals))
			goals = 0;

		if (index <= 4) {
			form.push(result);
			total_goals += goals;
		}
		/*This piece of code has an hack so that a migration of db is not needed.
		The variables of the + goals have wrong names  */
		if (result == 'V') {
			if (goals > 0 && goals < 5)
				isHome ? home_wins_minus_5++ : away_wins_minus_5++;
			if (goals > 1)
				isHome ? home_wins_plus_2++ : away_wins_plus_2++;
			if (goals > 2)
				isHome ? home_wins_plus_3++ : away_wins_plus_3++;
		}

	}
	var avg_goals_last_5 = (total_goals / 5).toFixed(2);
	return {
		'form': form, 'avg_goals_last_5': avg_goals_last_5,
		'home_wins_plus_2': home_wins_plus_2, 'home_wins_plus_3': home_wins_plus_3, 'home_wins_minus_5': home_wins_minus_5,
		'away_wins_plus_2': away_wins_plus_2, 'away_wins_plus_3': away_wins_plus_3, 'away_wins_minus_5': away_wins_minus_5
	};
}

module.exports.init = init;
module.exports.loadLeague = loadLeague;
module.exports.loadTeamFormPage = loadTeamFormPage;
module.exports.getTeams = getTeams;
module.exports.getTeamInfo = getTeamInfo;
module.exports.getTeamStats = getTeamStats;