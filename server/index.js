const express = require('express');
const path = require('path');
var request = require('request');

const PORT = process.env.PORT || 5000;


const app = express();
// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

var dbHelper = require('./db/db_helper.js');

dbHelper.connect(function(isConnected){
  if(!isConnected){
    console.log('Not Connected...');
  } else {
    console.log('Connected!!!');
  }
});

app.get('/api/competitions', function (req, res) {
    console.log("Requesting competitions");

    dbHelper.getCompetitions(function(err, result){
        if (err){
            res.send(err);
        }
        //return the results of the competition
        res.send(result);
    });
})

app.get('/api/leagues', function (req, res) {
    console.log("Requesting leagues");

    var competition = req.query.competition_id;

    dbHelper.getLeagues(competition, function(err, result){
        if (err){
            res.send(err);
        }
        //return the results of the competition
        res.send(result);
    });  
})

app.get('/api/teams', function (req, res) {
    console.log("Requesting teams");

    var league = req.query.league_id;

    dbHelper.getTeams(league, function(err, result){
        if (err){
            res.send(err);
        }
        //return the results of the competition
        res.send(result);
    });   
})

// Answer API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.error(`Node cluster worker ${process.pid}: listening on port ${PORT}`);
});


