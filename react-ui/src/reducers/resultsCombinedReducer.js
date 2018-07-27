import {combineReducers} from 'redux';
import homeReducer from './homeReducer.js';
import leagueReducer from './leagueReducer.js';

const resultsCombinedReducer = combineReducers({
  // short hand property names
  homeReducer,
  leagueReducer
})

export default resultsCombinedReducer;
