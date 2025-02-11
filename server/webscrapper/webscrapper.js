var request = require('request');
var cheerio = require('cheerio');
var configs;

function init(init_configs){
	configs = init_configs;
}

function loadLeague(web_id, callback){
	var url = configs.base_url + configs.league_page.replace("${web_id}", web_id);
	var options = {
		url: url,
		headers: {
			Cookie: "jcenabled_v1=1; zz_first_page_v1=1; FORCE_MODALIDADE_v1=1; FORCE_SITE_VERSION_v1=desktop; PHPSESSID=7sasb7n99orc22hca8asenq425; pvc=1; pvc_date=1739300494",
		},
		encoding: "binary"
  	}
	request(options, function(error, response, html){
		var conditions = ["Temporariamente Suspenso", "utilizadores registrados", "cookies"];
		if(!error && !conditions.some(el => html.includes(el))){
			var league_page = cheerio.load(html);
			callback(null, league_page);
        } else {
        	if(error){
        		callback(0);
        	} else if (html.includes('cookies')) callback(1);
			else if (html.includes('Temporariamente Suspenso')) callback(2);
			else callback(3);
        }
	});
}

function loadTeamFormPage(team_form_page_url, callback){
	var options = {
  		url: team_form_page_url,
  		headers: {
			  Cookie: "jcenable=1; jcenable_v1=1",
			},
		encoding: "binary"
	}
	request(options, function(error, response, html){
		var conditions = ["Temporariamente Suspenso", "utilizadores registrados", "cookies"];
		if(!error && !conditions.some(el => html.includes(el))){
			var team_form_page = cheerio.load(html);
			callback(null, team_form_page);
        } else {
        	if(error){
        		callback(0);
        	} else if (html.includes('cookies')) callback(1);
			else if (html.includes('Temporariamente Suspenso')) callback(2);
			else callback(3);
        }
	})
}

function getTeams(league_page){
	return league_page('#'+configs.table_id+' tbody tr');
}

function getTeamInfo(league_page, team){
	var team_page = league_page(team).children();
	var league_pos = team_page.eq(0).text();
	var name = team_page.eq(2).children().first().text();
	var games = team_page.eq(4).children().first().text();
	var results_page_url = configs.base_url + team_page.eq(4).children().last().attr('href');
	var team_id = new URLSearchParams(results_page_url).get('equipa');
	var wins = team_page.eq(5).children().first().text();
	var draws = team_page.eq(6).children().first().text();
	var losses = team_page.eq(7).children().first().text();
	var home_games = team_page.eq(13).children().first().text();
	var home_results_page_url = configs.base_url + team_page.eq(13).children().last().attr('href') + 'C';
 	var home_wins = team_page.eq(14).children().first().text();
  	var home_draws = team_page.eq(15).children().first().text();
 	var home_losses = team_page.eq(16).children().first().text();
 	var away_games = team_page.eq(21).children().first().text();
 	var away_results_page_url = configs.base_url + team_page.eq(21).children().last().attr('href') + 'F';
 	var away_wins = team_page.eq(22).children().first().text();
  	var away_draws = team_page.eq(23).children().first().text();
 	var away_losses = team_page.eq(24).children().first().text();
	return {'league_pos' : league_pos, 'name': name, 'team_id' : team_id,
			'games':games, 'results_link':results_page_url, 'wins': wins, 'draws': draws, 'losses': losses,
			'home_games': home_games, 'home_results_link': home_results_page_url, 'home_wins': home_wins, 'home_draws': home_draws, 'home_losses': home_losses, 
			'away_games': away_games, 'away_results_link': away_results_page_url, 'away_wins': away_wins, 'away_draws': away_draws, 'away_losses': away_losses};
}

function getTeamStats(team_form_page, team_name){
	var form = [];
	var home_wins_plus_2 = 0;
	var home_wins_plus_3 = 0;
	var home_wins_minus_5 = 0;
	var away_wins_plus_2 = 0;
	var away_wins_plus_3 = 0;
	var away_wins_minus_5 = 0;
	var team_page = team_form_page('#'+configs.team_form+' table tbody tr');
	var total_goals = 0;
	var last_match_index = team_page.length - 2;
	var start_index = last_match_index - 4;
	if(start_index < 0){
		start_index = 0;
	}

	for(index=0; index <= last_match_index; index++){
		var result = team_page.eq(index).children().eq(0).text();
		if(index >= start_index){
			form.push(result);
			var goals_string = team_page.eq(index).children().eq(5).text();
			var num_goals = parseInt(goals_string.charAt(0)) + parseInt(goals_string.slice(-1));
			if(isNaN(num_goals))
				num_goals = 0;
			total_goals += num_goals;
		}
		/*This piece of code has an hack so that a migration of db is not needed.
		The variables of the + goals have wrong names  */
		if(result == 'V'){
			var goals_string = team_page.eq(index).children().eq(5).text()
			var num_goals = parseInt(goals_string.charAt(0)) + parseInt(goals_string.slice(-1));
			if(isNaN(num_goals))
				num_goals = 0;
			var isHome = team_page.eq(index).children().eq(3).text() === team_name;
			if(num_goals > 0 && num_goals < 5)
				isHome ? home_wins_minus_5++ : away_wins_minus_5++;
			if(num_goals > 1)
				isHome ? home_wins_plus_2++ : away_wins_plus_2++;
			if(num_goals > 2)
				isHome ? home_wins_plus_3++ : away_wins_plus_3++;
		}

	}
	var avg_goals_last_5 = (total_goals/5).toFixed(2);
	return {'form' : form, 'avg_goals_last_5' : avg_goals_last_5, 
			'home_wins_plus_2' : home_wins_plus_2, 'home_wins_plus_3' : home_wins_plus_3, 'home_wins_minus_5' : home_wins_minus_5,
			'away_wins_plus_2' : away_wins_plus_2, 'away_wins_plus_3' : away_wins_plus_3, 'away_wins_minus_5' : away_wins_minus_5};
}

module.exports.init = init;
module.exports.loadLeague = loadLeague;
module.exports.loadTeamFormPage = loadTeamFormPage;
module.exports.getTeams = getTeams;
module.exports.getTeamInfo = getTeamInfo;
module.exports.getTeamStats = getTeamStats;