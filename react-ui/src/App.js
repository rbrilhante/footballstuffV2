import React , { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, BrowserRouter } from 'react-router-dom';
import { getCompetitions, getLeaguesById } from './actions/resultsActions';
import PropTypes from 'prop-types';
import TableComponent from './TableComponent'
import ReactLoading from 'react-loading';
import './styles/react-router-tabs.css';
import './styles/styles.css';
import { DropdownButton, MenuItem, Nav, NavItem } from 'react-bootstrap';

class App extends Component {

  constructor(props) {
    super(props);
    this.onChangedCompetition = this.onChangedCompetition.bind(this);
    this.onChangedLeague = this.onChangedLeague.bind(this);
  }

  componentWillMount() {
    this.props.dispatch(getCompetitions());
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.competitions){
      this.setState({competitions: nextProps.competitions, year: nextProps.competitions[0].year});
      this.props.dispatch(getLeaguesById(nextProps.competitions[0]._id));
    }
    if(nextProps.leagues){
      this.setState({leagues: nextProps.leagues, league: nextProps.leagues[0].league_id});
    }
    this.setState({loading: nextProps.loading})
  }

  onChangedCompetition(competition_id, year) {
    this.setState({year: year});
    this.props.dispatch(getLeaguesById(competition_id));
  }

  onChangedLeague(league_id) {
    this.setState({league: league_id});
  }

  render() {
    var tabs = <ReactLoading className="loader" type="spin" color="#444" height='50px' width='50px'/>;
    var dropdown = "";
    var homeRoute = "";

    if(this.state && this.state.competitions && !this.state.loading){
      dropdown = <DropdownButton 
                title={this.state.year}>
                  {this.state.competitions.map((competition, index) => {
                    var activeClass;
                    if(this.state.year === competition.year) activeClass='active';
                    return <MenuItem className={activeClass} onSelect={()=>this.onChangedCompetition(competition._id, competition.year)}>{competition.year}</MenuItem>
                    })
                  }
               </DropdownButton>
    }
    if(this.state && this.state.leagues && !this.state.loading){
      tabs = <Nav bsStyle="pills" stacked onSelect={this.onChangedLeague}>
              {this.state.leagues.map(league => {
                var activeClass;
                if(this.state.league === league.league_id) activeClass='active';
                return <NavItem className={activeClass} eventKey={league.league_id}>{league.name}</NavItem>})}
             </Nav>
    }

    return (  
        <div className='main-container'>
          {dropdown}
          <BrowserRouter>
            <div>
              {tabs}
              <TableComponent league_id={this.state ? this.state.league : null}/>
            </div>
          </BrowserRouter>
        </div>
      
    );
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    competitions: state.homeReducer.competitions,
    loading: state.homeReducer.loading,
    leagues: state.homeReducer.leagues
  };
}

export default connect(mapStateToProps)(App);
