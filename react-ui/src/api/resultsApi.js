export default class resultsApi {

  static getCompetitions(){
    return fetch('/api/competitions')
    .then(response => { 
      return response.json() })
    .catch(error => {
      console.log(error);
      return error;
    });
  }

  static getLeagues(id){
    return fetch('/api/leagues?competition_id='+id)
    .then(response => { return response.json() })
    .catch(error => {
      console.log(error);
      return error;
    });
  }

  static getLeague(id) {
    return fetch('/api/teams?league_id='+id)
    .then(response => { if(id == 187411) console.log(response.json()); return response.json() })
    .catch(error => {
      console.log(error);
      return error;
    });
  }
}
