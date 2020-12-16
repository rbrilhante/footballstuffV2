import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import resultsstore from './stores/resultsStore.js';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const store = resultsstore();

ReactDOM.render(
	<Provider store={store}>
  	<App />
  </Provider>,
  document.getElementById('root')
);
