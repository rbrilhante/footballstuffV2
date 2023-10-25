const express = require('express');
const path = require('path');
var cron = require('node-cron');
var axios = require('axios');
var cronJob = require('./cronjob.js');

const PORT = process.env.PORT || 4000;

const http = axios.create({
  baseURL: 'https://keep-alive-fwct.onrender.com'
});

function keepAlive() {
  return http.get('/api').then((response) => console.log(response.data));
}

cron.schedule(`*/10 * * * *`, async () => {
  console.log("Keeping alive")
  keepAlive();
})

const app = express();
// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

var dbHelper = require('./db/db_helper.js');

dbHelper.connect(function(isConnected){
  if(!isConnected){
    console.log('Not Connected...');
  } else {
    console.log('Connected!!!');
    cronJob.init(dbHelper);
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
  res.send('Server is alive');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.error(`Node cluster worker ${process.pid}: listening on port ${PORT}`);
});


