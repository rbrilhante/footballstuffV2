import {createStore, applyMiddleware} from 'redux';
import resultsCombinedReducer from '../reducers/resultsCombinedReducer';
import thunk from 'redux-thunk';

export default function resultsstore() {
return createStore(
    resultsCombinedReducer,
    applyMiddleware(thunk)
  );
}
