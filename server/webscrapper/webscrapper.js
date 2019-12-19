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
	points = team_page.eq(3).children().first().text(); 
	games = team_page.eq(4).children().first().text();
	form_page_url = configs.base_url + team_page.eq(4).children().last().attr('href');
	home_form_page_url = configs.base_url + team_page.eq(12).children().last().attr('href');
 	home_wins = team_page.eq(13).children().first().text();
  	home_draws = team_page.eq(14).children().first().text();
 	home_losses = team_page.eq(15).children().first().text();
 	home_goals_scored = team_page.eq(16).children().first().text();
 	home_goals_against = team_page.eq(17).children().first().text();
 	away_form_page_url = configs.base_url + team_page.eq(19).children().last().attr('href');
 	away_wins = team_page.eq(20).children().first().text();
  	away_draws = team_page.eq(21).children().first().text();
 	away_losses = team_page.eq(22).children().first().text();
 	away_goals_scored = team_page.eq(23).children().first().text();
 	away_goals_against = team_page.eq(24).children().first().text();
	return {'league_pos' : league_pos, 'name': name, 'points': points, 'games':games, 'form_page':form_page_url,
			'home_form_page': home_form_page_url, 'home_wins': home_wins, 'home_draws': home_draws, 'home_losses': home_losses, 
			'home_goals_scored': home_goals_scored, 'home_goals_against': home_goals_against,
			'away_form_page': away_form_page_url, 'away_wins': away_wins, 'away_draws': away_draws, 'away_losses': away_losses, 
			'away_goals_scored': away_goals_scored, 'away_goals_against': away_goals_against};
}

function getTeamForm(team_form_page){
	var form = [];
	var team_page = team_form_page('#'+configs.team_form+' table tbody tr .form');
	var last_match_index = team_page.length - 1;
	var start_index = last_match_index - 4;
	if(start_index < 0){
		start_index = 0;
	}
	for(; start_index <= last_match_index; start_index++){
		form.push(team_page.eq(start_index).children().text());
	}
	return form;
}

module.exports.init = init;
module.exports.loadLeague = loadLeague;
module.exports.loadTeamFormPage = loadTeamFormPage;
module.exports.getTeams = getTeams;
module.exports.getTeamInfo = getTeamInfo;
module.exports.getTeamForm = getTeamForm;