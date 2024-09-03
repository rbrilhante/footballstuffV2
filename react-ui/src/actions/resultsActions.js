import * as actionTypes from './resultsActionTypes';
import resultsApi from '../api/resultsApi';

export function receivedCompetitons(competitions) {
  return {type: actionTypes.COMPETITIONS_RECEIVED, state: competitions};
}

export function receivedLeagues(leagues) {
  return {type: actionTypes.LEAGUES_RECEIVED, state: leagues};
}

export function receivedLeague(league) {
  return {type: actionTypes.LEAGUE_RECEIVED, state: league};
}

export function loadingLeague() {
  return {type: actionTypes.LOADING_LEAGUE, state : {}};
}

export function loadingCompetitions() {
  return {type: actionTypes.LOADING_COMPETITIONS, state : {}};
}

export function getCompetitions() {
    return function(dispatch) {
      dispatch(loadingCompetitions());
      resultsApi.getCompetitions().then(resp => {
          return dispatch(receivedCompetitons(resp));
        });
    }
}

export function getLeaguesById(id) {
    return function(dispatch) {
      resultsApi.getLeagues(id).then(resp => {
          return dispatch(receivedLeagues(resp));
        });
    }
}

export function getLeague(id) {
  return function(dispatch) {
    dispatch(loadingLeague());
    resultsApi.getLeague(id).then(resp => {
        console.log(resp);
        return dispatch(receivedLeague(resp));
      });
  }
}

