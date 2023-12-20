var cron = require('node-cron');
var webScrapper = require('./webscrapper/webscrapper.js');
var fs = require('fs');
var configs;

const RESULT = {
  SUCCESS : "success",
  LOGIN_ERROR : "login error",
  NO_UPDATE : "no update"
}

const MAX_COUNTER = 15;

function init(dbHelper_init){
  console.log("Initalizing Cron...")
  dbHelper = dbHelper_init;
  fs.readFile('./server/config.json', 'utf8', function (err, data) {
    if (err) throw err;
    configs = JSON.parse(data);
    webScrapper.init(configs.web_scrapper);
  });
  cron.schedule(`0 */4 * * *`, async () => {
    var datetime = new Date();
    console.log('Running ChronJob at ' + datetime);
    updateStats();
  })
}

function getCurrentYear(){
  var datetime = new Date();
  var current_year = datetime.getFullYear();
  var month = datetime.getMonth() + 1;
  if(month <= 6){
      current_year = current_year - 1;
  }
  return current_year;
}

function updateStats(){
  var year = getCurrentYear();
  dbHelper.getCompetitionByYear(year, function(competition){
    if(competition){
      dbHelper.getLeagues(competition._id, async function(err, leagues){
        if(err){
          console.log(err);
        } else {
          counter = 0;
          for(var i = 0; i < leagues.length && counter < MAX_COUNTER; i++){
            var result = await updateLeague(leagues[i], counter);
            if(result.msg == RESULT.LOGIN_ERROR)
              break;
            counter = result.counter;
          }
          console.log("Job Done! Updated " + counter + " teams");
        }
      });
    } else {
      insertCompetition(year);
    }
  });
}

function insertCompetition(current_year){
  var leagues;
  configs.competitions.forEach(function(competition){
    if(competition.year == current_year)
      leagues = competition.leagues;
  });
  if(leagues){
    dbHelper.saveCompetition(current_year, leagues.size, function(competition){
      leagues.forEach(function(league){
        dbHelper.saveLeague(league.name, league.web_id, competition._id);
      });
    });
  }
}

async function updateLeague(league, counter){
  return new Promise(function(resolve) {
    var result = {
      msg : "",
      counter : counter
    } 
    webScrapper.loadLeague(league.league_id, async function(error, league_page){
      if(error){
        console.log('Could not get league of ' + league.name + ' due to '+ error);
        result.msg = RESULT.LOGIN_ERROR
        resolve(result);
      } else {
        var teams = webScrapper.getTeams(league_page);
        for (var i = 0; i < teams.length && result.counter < MAX_COUNTER; i++){
          result.msg = await updateTeam(teams[i], league_page, league.league_id);
          if(result.msg == RESULT.LOGIN_ERROR) break;
          else if(result.msg == RESULT.SUCCESS) result.counter = result.counter + 1;
        }
        if(result.msg != RESULT.LOGIN_ERROR) console.log(league.name + " is fully updated");
        resolve(result);
      }
    });
  });
}

async function updateTeam(team, league_page, league_id){
  return new Promise(function(resolve) {
    var web_team = webScrapper.getTeamInfo(league_page, team);
    dbHelper.getTeam(web_team.name, league_id, function(team){
      if(team.games != web_team.games || team.league_pos != web_team.league_pos || team.form[0] == ""){
        console.log('Updating ' + web_team.name);
        webScrapper.loadTeamFormPage(web_team.results_link, function(error, form_page){
          if(error){
            console.log('Could not get form of ' + web_team.name + ' due to '+ error);
            resolve(RESULT.LOGIN_ERROR);
          } else {
            var stats = webScrapper.getTeamStats(form_page, web_team.name);
            dbHelper.saveTeam(team, league_id, web_team, stats);
            resolve(RESULT.SUCCESS);
          }
        });
      } else {
        resolve(RESULT.NO_UPDATE);
      }
    });
  })
  
}

module.exports.updateStats = updateStats;
module.exports.init = init;