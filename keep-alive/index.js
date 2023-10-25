var cron = require('node-cron');
var axios = require('axios');

const http = axios.create({
  baseURL: 'https://rbrilhante.onrender.com'
});

function keepAlive() {
  return http.get('/api').then((response) => console.log(response.data));
}

cron.schedule(`*/10 * * * *`, async () => {
  console.log("Keeping alive")
  keepAlive();
})