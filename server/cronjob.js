var dbHelper = require('./db/db_helper.js');
var webScrapper = require('./webscrapper/webscrapper.js');
var fs = require('fs');
var configs;
fs.readFile('./server/config.json', 'utf8', function (err, data) {
  if (err) throw err;
  configs = JSON.parse(data);
});

// Priority serve any static files.
console.log('Running ChronJob');
dbHelper.connect(function(isConnected){
  if(!isConnected){
    console.log('Not Connected...');
  } else {
    console.log('Connected!!!');
    webScrapper.init(configs.web_scrapper);
    cronJob();
  }
});

function cronJob(){

  var datetime = new Date();
  var current_year = datetime.getFullYear();
  var month = datetime.getMonth() + 1;

  if(month <= 7){
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
      teams.each(function(){
        var web_team = webScrapper.getTeamInfo(league_page, this);
        dbHelper.getTeam(web_team.name, league.league_id, function(team){
          if(team.games != web_team.games || team.form[0] == ""){
            webScrapper.loadTeamFormPage(web_team.form_page, function(error, form_page){
              if(error){
                console.log('Could not get form of ' + web_team.name + ' due to '+ error);
              } else {
                var form = webScrapper.getTeamForm(form_page);
                dbHelper.saveTeam(team, league.league_id, web_team, form);
              }
            });
          }
        });
      });
    }
  });
}