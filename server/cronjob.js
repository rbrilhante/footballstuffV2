var webScrapper = require('./webscrapper/webscrapper.js');
var fs = require('fs');
var configs;
var goSleep = 0;
var restingCycle = 0;
var loginError = false;
var league_links = [];

const RESULT = {
  SUCCESS: "success",
  NO_UPDATE: "no update",
}

const ERRORS = {
  UNKNOWN: "unknown",
  COOKIES: "cookies",
  SUSPENDED: "suspended page",
  LOGIN_ERROR: "lack of login"
}

function init(dbHelper_init) {
  console.log("Initalizing Cron...")
  dbHelper = dbHelper_init;
  fs.readFile('./server/config.json', 'utf8', function (err, data) {
    if (err) throw err;
    configs = JSON.parse(data);
    webScrapper.init(configs.web_scrapper);
  });
}

async function updateStats() {
  if (goSleep > 0) {
    console.log("I need to rest a bit...for " + goSleep + " more cycles");
    goSleep--;
    restingCycle++;
    return;
  }
  console.log("Updating stats!");
  var year = configs.competitions.year;
  var competition = await dbHelper.getCompetitionByYear(year)
  if (competition) {
    console.log("Found a competition!");
    var leagues = await dbHelper.getLeagues(competition._id);
    counter = 0;
    message = "";
    for (var i = 0; i < leagues.length; i++) {
      //dbHelper.deleteTeams(leagues[i].league_id);
      var result = await updateLeague(leagues[i], counter);
      counter = result.counter;
      if (Object.values(ERRORS).some(el => result.msg == el)) {
        message = result.msg;
        if (message == ERRORS.LOGIN_ERROR)
          break;
      }
    }
    console.log("Job Done! Updated " + counter + " teams");

    if (counter == 0) {
      if (message == ERRORS.LOGIN_ERROR) {
        restingCycle++;
      } else {
        if (loginError) dbHelper.saveCycle(restingCycle, counter);
        restingCycle = 0;
      }
    } else {
      if (loginError) dbHelper.saveCycle(restingCycle, counter);
      restingCycle = 0;
    }
    loginError = message == ERRORS.LOGIN_ERROR;

    if (loginError || message == "" || message == ERRORS.COOKIES)
      goSleep = 150;
  } else {
    insertCompetition(year);
  }
}

async function insertCompetition(current_year) {
  var leagues = configs.competitions.leagues;
  if (leagues) {
    var competition = await dbHelper.saveCompetition(current_year, leagues.length)
    for (var i = 0; i < leagues.length; i++) {
      await dbHelper.saveLeague(leagues[i], competition._id);
      console.log("Saved " + leagues[i].name);
    }
  }
}

async function updateLeague(league, curr_counter) {
  var result = {
    msg: "",
    counter: curr_counter
  }
  var league_page = await webScrapper.loadLeague(league.league_id)//, async function (error, league_page) {
  if (league_page) {
    var league_id = league_page.Sid;
    var teams = league_page.LeagueTable.L[0].Tables[0].team;
    for (var i = 0; i < teams.length; i++) {
      result.msg = await updateTeam(teams[i], league_id, league.league_id);
      if (result.msg == ERRORS.LOGIN_ERROR) break;
      else if (result.msg == RESULT.SUCCESS) result.counter = result.counter + 1;
    }
    if (!Object.values(ERRORS).some(el => result.msg == el)) console.log(league.name + " is fully updated");
    return result;
  } else {
    console.log('Could not get ' + league.name + ' due to ' + result.msg);
    return result;
  }
}

async function updateTeam(team, web_league_id, league_id) {
  var web_team = webScrapper.getTeamInfo(team);
  var team = await dbHelper.getTeam(web_team.team_id, league_id);
  if (!team.results_link) {
    var team_link = await getTeamLink(team);
    team.results_link = team_link;
  }
  if (team.games != web_team.games || team.form.length == 0) {
    console.log('Updating ' + web_team.name);
    var result = await webScrapper.loadTeamFormPage(web_team, web_league_id);
    if (result) {
      var stats = webScrapper.getTeamStats(result, web_team.name);
      await dbHelper.saveTeam(team, league_id, web_team, stats);
      return RESULT.SUCCESS;
    } else {
      console.log('Could not get form of ' + web_team.name + ' due to ' + result);
      return ERRORS.UNKNOWN;
    }
    /*} else if (team.league_pos != web_team.league_pos) {
      console.log('Updating ' + web_team.name + ' league position');
      await dbHelper.saveTeamPos(team, web_team.league_pos);
      return RESULT.SUCCESS;*/
  } else {
    return RESULT.NO_UPDATE;
  }
}

async function getTeamLink(team) {
  let team_with_link = league_links.find(result => result.team_name == team.name)
  if (team_with_link)
    return team_with_link.link;
  await getAllTeamLinks();
  return league_links.find(result => result.team_name == team.name);
}

async function getAllTeamLinks() {
  for (var index = 0; index < configs.competitions.leagues.length; index++) {
    var league = configs.competitions.leagues[index];
    if (!league_links.find(result => result.zero_zero == league.zero_zero)) {
      var links = await webScrapper.loadZLeague(league.zero_zero);
      if (links && links != 1 && links != 2 && links != 3) {
        var teams = webScrapper.getTeams(links);
        for (var i = 0; i < teams.length; i++) {
          var team = webScrapper.getTeamLink(links, teams[i]);
          league_links.push({ zero_zero: league.zero_zero, team_name: team.name, link: team.url });
        }
      } else {
        var msg = Object.values(ERRORS)[links];
        console.log('Could not get ' + league.name + ' due to ' + msg);
      }
    }
  }
}

module.exports.updateStats = updateStats;
module.exports.init = init;