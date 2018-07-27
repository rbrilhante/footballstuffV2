import * as actionTypes from '../actions/resultsActionTypes';
import initialState from './initialState';

export default function leagueReducer(state = initialState.league, action) {
	switch(action.type) {
		case actionTypes.LEAGUE_RECEIVED:
		return {
			loading: false,
			league: action.state
		}
  		case actionTypes.LOADING_LEAGUE:
  		return {
			loading: true,
			league: action.state
		}
		default:
  		return state;
	}
}
