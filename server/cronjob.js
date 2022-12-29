var cron = require('node-cron');
var dbHelper = require('./db/db_helper.js');
var webScrapper = require('./webscrapper/webscrapper.js');
var fs = require('fs');
var configs;
var connected;
fs.readFile('./config.json', 'utf8', function (err, data) {
  if (err) throw err;
  configs = JSON.parse(data);
});

// Priority serve any static files.
cron.schedule(`0 * * * *`, async () => {
  var now = new Date();
  console.log('Running ChronJob at ' + now);
  if(connected){
    cronJob();
  }
  else {
    dbHelper.connect(function(isConnected){
      connected = isConnected;
      if(!isConnected){
        console.log('Not Connected...');
      } else {
        console.log('Connected!!!');
        webScrapper.init(configs.web_scrapper);
        cronJob();
      }
    })
  }
})

function cronJob(){

  var datetime = new Date();
  var current_year = datetime.getFullYear();
  var month = datetime.getMonth() + 1;

  if(month <= 6){
      current_year = current_year - 1;
  }

  dbHelper.getCompetitionByYear(current_year, function(competition){
    if(competition){
      dbHelper.getLeagues(competition._id, function(err, leagues){
        if(err){
          console.log(err);
        } else {
          leagues.forEach(function(league){
            updateLeague(league);
          });
        }
      });
    } else {
      insertCompetition(current_year);
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
        dbHelper.saveLeague(league.name, league.web_id, competition._id, function(db_league){
          updateLeague(db_league);
        });
      });
    });
  }
}

function updateLeague(league){
  webScrapper.loadLeague(league.league_id, function(error, league_page){
    if(error){
      console.log('Could not get league of ' + league.name + ' due to '+ error);
    } else {
      var teams = webScrapper.getTeams(league_page);
      var counter = 0;
      teams.each(function(){
        var web_team = webScrapper.getTeamInfo(league_page, this);
        dbHelper.getTeam(web_team.name, league.league_id, function(team){
          if(counter < 2 && (team.games != web_team.games || team.league_pos != web_team.league_pos || team.form[0] == "")){
            console.log('Updating ' + team.name);
            counter++;
            webScrapper.loadTeamFormPage(web_team.results_link, function(error, form_page){
              if(error){
                console.log('Could not get form of ' + web_team.name + ' due to '+ error);
              } else {
                var stats = webScrapper.getTeamGeneralStats(form_page);
                webScrapper.loadTeamFormPage(web_team.away_results_link, function(error, form_page){
                  if(error){
                    console.log('Could not get away form of ' + web_team.name + ' due to '+ error);
                  } else {
                    var away_stats = webScrapper.getTeamStats(form_page);
                    webScrapper.loadTeamFormPage(web_team.home_results_link, function(error, form_page){
                      if(error){
                        console.log('Could not get home form of ' + web_team.name + ' due to '+ error);
                      } else {
                        var home_stats = webScrapper.getTeamStats(form_page);
                        dbHelper.saveTeam(team, league.league_id, web_team, stats, home_stats, away_stats);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });
    }
  });
}