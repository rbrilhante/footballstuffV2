import * as actionTypes from '../actions/resultsActionTypes';
import initialState from './initialState';

export default function homeReducer(state = initialState.home, action) {
	switch(action.type) {
		case actionTypes.LEAGUES_RECEIVED:
  			return {
				loading: false,
				leagues: action.state
			}
  		case actionTypes.COMPETITIONS_RECEIVED:
  			return {
  				loading: true,
				competitions: action.state
			}
		case actionTypes.LOADING_COMPETITIONS:
  			return {
				loading: true,
		}
		default:
  			return state;
	}
}
