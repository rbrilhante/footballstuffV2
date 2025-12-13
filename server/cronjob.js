var webScrapper = require('./webscrapper/webscrapper.js');
var fs = require('fs');
var configs;
var goSleep = 0;
var restingCycle = 0;
var loginError = false;

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
  return new Promise(function (resolve) {
    var result = {
      msg: "",
      counter: curr_counter
    }
    webScrapper.loadLeague(league.web_id, async function (error, league_page) {
      if (error) {
        result.msg = Object.values(ERRORS)[error];
        console.log('Could not get ' + league.name + ' due to ' + result.msg);
        resolve(result);
      } else {
        var league_id = league_page.Sid;
        //dbHelper.deleteTeams(league_id);
        var teams = league_page.LeagueTable.L[0].Tables[0].team;
        for (var i = 0; i < teams.length; i++) {
          result.msg = await updateTeam(teams[i], league_id, league.web_id);
          if (result.msg == ERRORS.LOGIN_ERROR) break;
          else if (result.msg == RESULT.SUCCESS) result.counter = result.counter + 1;
        }
        if (!Object.values(ERRORS).some(el => result.msg == el)) console.log(league.name + " is fully updated");
        resolve(result);
      }
    });
  });
}

async function updateTeam(team, web_league_id, league_id) {
  var web_team = webScrapper.getTeamInfo(team);
  var team = await dbHelper.getTeam(web_team.team_id, league_id)
  if (team.games != web_team.games || team.form.length == 0) {
    console.log('Updating ' + web_team.name);
    webScrapper.loadTeamFormPage(web_team, web_league_id, async function (error, form) {
      if (error) {
        error = Object.values(ERRORS)[error];
        console.log('Could not get form of ' + web_team.name + ' due to ' + error);
        return error;
      } else {
        var stats = webScrapper.getTeamStats(form, web_team.name);
        await dbHelper.saveTeam(team, league_id, web_team, stats);
        return RESULT.SUCCESS;
      }
    });
  } else if (team.league_pos != web_team.league_pos) {
    console.log('Updating ' + web_team.name + ' league position');
    await dbHelper.saveTeamPos(team, web_team.league_pos);
    return RESULT.SUCCESS;
  } else {
    return RESULT.NO_UPDATE;
  }
}

module.exports.updateStats = updateStats;
module.exports.init = init;