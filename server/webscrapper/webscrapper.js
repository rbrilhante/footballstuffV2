var request = require('request');
var cheerio = require('cheerio');
var configs;

function init(init_configs){
	configs = init_configs;
}

function loadLeague(league_id, callback){
	var j = request.jar();
	var url = configs.base_url + configs.league_page + league_id;
	var cookie = request.cookie("jcenable=1");
	j.setCookie(cookie, url);
	var options = {
  		url: url,
  		jar: j,
  		encoding: 'binary'
	}
	request(options, function(error, response, html){
		if(!error && !html.includes('cookies')){
			var league_page = cheerio.load(html);
			callback(null, league_page);
        } else {
        	if(error){
        		callback(error);
        	} else callback('cookies');
        }
	});
}



function loadTeamFormPage(team_form_page_url, callback){
	var j = request.jar();
	var cookie = request.cookie("jcenable=1");
	j.setCookie(cookie, team_form_page_url);
	var options = {
  		url: team_form_page_url,
  		jar: j,
  		encoding: 'binary'
	}
	request(options, function(error, response, html){
		if(!error && !html.includes('utilizadores registrados') && !html.includes('cookies')){
			var team_form_page = cheerio.load(html);
			callback(null, team_form_page);
        } else {
        	if(error){
        		callback(error);
        	} else if (html.includes('cookies')) callback('cookies');
        	else callback('lack of login');
        }
	})
}

function getTeams(league_page){
	return league_page('#'+configs.table_id+' tbody tr');
}

function getTeamInfo(league_page, team){
	var team_page = league_page(team).children();
	league_pos = team_page.eq(0).text();
	name = team_page.eq(2).children().first().text();
	games = team_page.eq(4).children().first().text();
	results_page_url = configs.base_url + team_page.eq(4).children().last().attr('href');
	wins = team_page.eq(5).children().first().text();
	draws = team_page.eq(6).children().first().text();
	losses = team_page.eq(7).children().first().text();
	home_games = team_page.eq(13).children().first().text();
	home_results_page_url = configs.base_url + team_page.eq(13).children().last().attr('href');
 	home_wins = team_page.eq(13).children().first().text();
  	home_draws = team_page.eq(15).children().first().text();
 	home_losses = team_page.eq(16).children().first().text();
 	away_games = team_page.eq(21).children().first().text();
 	away_results_page_url = configs.base_url + team_page.eq(21).children().last().attr('href');
 	away_wins = team_page.eq(22).children().first().text();
  	away_draws = team_page.eq(23).children().first().text();
 	away_losses = team_page.eq(24).children().first().text();
	return {'league_pos' : league_pos, 'name': name,
			'games':games, 'results_link':results_page_url, 'wins': wins, 'draws': draws, 'losses': losses,
			'home_games': home_games, 'home_results_link': home_results_page_url, 'home_wins': home_wins, 'home_draws': home_draws, 'home_losses': home_losses, 
			'away_games': away_games, 'away_results_link': away_results_page_url, 'away_wins': away_wins, 'away_draws': away_draws, 'away_losses': away_losses};
}

function getTeamGeneralStats(team_form_page){
	var form = [];
	var team_page = team_form_page('#'+configs.team_form+' table tbody tr');
	var total_goals = 0;
	var last_match_index = team_page.length - 2;
	var start_index = last_match_index - 4;
	if(start_index < 0){
		start_index = 0;
	}
	for(; start_index <= last_match_index; start_index++){
		form.push(team_page.eq(start_index).children().eq(0).text());
		var goals_string = team_page.eq(start_index).children().eq(4).text();
		var num_goals = parseInt(goals_string.charAt(0)) + parseInt(goals_string.slice(-1));
		total_goals += num_goals;
	}
	var avg_goals_last_5 = (total_goals/5).toFixed(2)
	return {'form' : form, 'avg_goals_last_5' : avg_goals_last_5};
}

function getTeamStats(team_form_page){
	var form = [];
	var win_plus_2 = 0;
	var win_plus_3 = 0;
	var win_minus_5 = 0;
	var team_page = team_form_page('#'+configs.team_form+' table tbody tr');
	var last_match_index = team_page.length - 2;
	var start_index = last_match_index - 4;
	if(start_index < 0){
		start_index = 0;
	}
	for(index=0; index <= last_match_index; index++){
		var result = team_page.eq(index).children().eq(0).text();
		if(index >= start_index){
			form.push(result);
		}
		if(result == 'V'){
			var goals_string = team_page.eq(index).children().eq(4).text()
			var num_goals = parseInt(goals_string.charAt(0)) + parseInt(goals_string.slice(-1));
			if(num_goals < 5)
				win_minus_5++;
			if(num_goals > 2)
				win_plus_2++;
			if(num_goals > 3)
				win_plus_3++;
		}
	}
	
	return {'win_plus_2' : win_plus_2, 'win_plus_3' : win_plus_3, 'win_minus_5' : win_minus_5, 'form' : form};
}

module.exports.init = init;
module.exports.loadLeague = loadLeague;
module.exports.loadTeamFormPage = loadTeamFormPage;
module.exports.getTeams = getTeams;
module.exports.getTeamInfo = getTeamInfo;
module.exports.getTeamGeneralStats = getTeamGeneralStats;
module.exports.getTeamStats = getTeamStats;