const express = require('express');
const path = require('path');
var cron = require('node-cron');
var axios = require('axios');
var cronJob = require('./cronjob.js');

const PORT = process.env.PORT || 4000;

const http = axios.create({
  baseURL: 'https://rbrilhante.onrender.com'
});

function keepAlive() {
  return http.get('/api/keepalive').then((response) => console.log(response.data));
}

cron.schedule(`* * * * *`, async () => {
  console.log("Am I dead?")
  cronJob.updateStats();
  keepAlive();
})

const app = express();
// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

var dbHelper = require('./db/db_helper.js');

dbHelper.connect(function (isConnected) {
  if (!isConnected) {
    console.log('Not Connected...');
  } else {
    console.log('Connected!!!');
    cronJob.init(dbHelper);
  }
});

app.get('/api/competitions', async function (req, res) {
  console.log("Requesting competitions");

  var result = await dbHelper.getCompetitions();
  //return the results of the competition
  res.send(result);
})

app.get('/api/leagues', async function (req, res) {
  console.log("Requesting leagues");

  var competition = req.query.competition_id;

  var result = await dbHelper.getLeagues(competition);
  //return the results of the competition
  res.send(result);
});

app.get('/api/teams', async function (req, res) {
  console.log("Requesting teams");

  var league = req.query.league_id;

  var result = await dbHelper.getTeams(league);
  //return the results of the competition
  res.send(result);
})

// Keep alive answer
app.get('/api/keepalive', function (req, res) {
  res.send('Nop, I\'m still alive');
});

// All remaining requests return the React app, so it can handle routing.
app.get('/{*any}', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.error(`Node cluster worker ${process.pid}: listening on port ${PORT}`);
});


