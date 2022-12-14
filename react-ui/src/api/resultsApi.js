export default class resultsApi {

  static getCompetitions(){
    return fetch('https://server-production-4990.up.railway.app/api/competitions')
    .then(response => { 
      return response.json() })
    .catch(error => {
      console.log(error);
      return error;
    });
  }

  static getLeagues(id){
    return fetch('https://server-production-4990.up.railway.app/api/leagues?competition_id='+id)
    .then(response => { return response.json() })
    .catch(error => {
      console.log(error);
      return error;
    });
  }

  static getLeague(id) {
    return fetch('https://server-production-4990.up.railway.app/api/teams?league_id='+id)
    .then(response => { return response.json() })
    .catch(error => {
      console.log(error);
      return error;
    });
  }
}
