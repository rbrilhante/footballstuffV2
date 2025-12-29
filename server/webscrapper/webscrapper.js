var cheerio = require('cheerio');
var axios = require('axios');
var configs;

function init(init_configs) {
	configs = init_configs;

}

async function loadZLeague(league_zero_zero) {
	var url = configs.zero_zero_competitions_base_url + league_zero_zero;
	var response = await axios.get(url).catch(function (error) {
		console.log("Error getting " + url);
		return null;
	});
	if (response && response.status == 200) {
		var conditions = ["Temporariamente Suspenso", "utilizadores registrados", "cookies"];
		if (!conditions.some(el => response.data.includes(el))) {
			var league_page = cheerio.load(response.data);
			return league_page;
		} else {
			if (response.data.includes('cookies')) return 1;
			else if (response.data.includes('Temporariamente Suspenso')) return 2;
			else return 3;
		}
	} else {
		return null;
	}
}

async function loadLeague(web_id) {
	var url = configs.league_page.replace("${league_id}", web_id);
	var response = await axios.get(url).catch(function (error) {
		console.log("Error getting " + url);
		return null;
	});
	if (response && response.status == 200) {
		return response.data.Stages[0];
	} else {
		return null;
	}
}

async function loadTeamFormPage(team, league_id) {
	var url = configs.teams_form_base_url.replace("${team_name}", team.name).replace("${team_id}", team.team_id).replace("${league_id}", league_id);
	var response = await axios.get(url).catch(function (error) {
		console.log("Error getting " + url);
		return null;
	});
	if (response && response.status == 200) {
		return response.data.pageProps.initialData.eventsByMatchType[0].Events;
	} else {
		console.log(response.statusText);
		return null;
	}
}

function getTeams(league_page) {
	return league_page('#' + configs.table_id + ' tbody tr');
}

function getTeamLink(league_links, team) {
	var team_page = league_links(team).children();
	var team_name = team_page.eq(2).children().first().text();
	var results_page_url = team_page.eq(4).children().last().attr('href');
	var position = team_page.eq(0).text();
	return {
		'name': team_name, 'link': configs.zero_zero_base_url + results_page_url, 'position': position
	};
}

function getTeamInfo(team) {
	return {
		'league_pos': team.rnk, 'name': team.Tnm, 'team_id': team.Tid,
		'games': team.pld, 'wins': team.win, 'draws': team.drw, 'losses': team.lst
	};
}

function getTeamStats(team_form, team_name) {
	var form = [];
	var home_games = 0;
	var away_games = 0;
	var home_wins = 0;
	var away_wins = 0;
	var home_wins_plus_2 = 0;
	var home_wins_plus_3 = 0;
	var home_wins_minus_5 = 0;
	var away_wins_plus_2 = 0;
	var away_wins_plus_3 = 0;
	var away_wins_minus_5 = 0;
	var total_goals = 0;

	for (index = team_form.length - 1; index >= 0; index--) {

		if (team_form[index].Eps != "FT") continue;

		var homeGoals = parseInt(team_form[index].Tr1);
		var awayGoals = parseInt(team_form[index].Tr2);
		var isHome = team_form[index].T1[0].Nm === team_name;

		isHome ? home_games++ : away_games++;

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
			isHome ? home_wins++ : away_wins++;
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
		'form': form, 'avg_goals_last_5': avg_goals_last_5, 'home_games': home_games, 'away_games': away_games, 'home_wins': home_wins, 'away_wins': away_wins,
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
module.exports.loadZLeague = loadZLeague;
module.exports.getTeamLink = getTeamLink;