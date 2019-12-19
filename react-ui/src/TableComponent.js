import React , { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getLeague } from './actions/resultsActions';
import { Table } from 'react-bootstrap';
import ReactLoading from 'react-loading';

class TableComponent extends Component {

  componentWillReceiveProps(nextProps) {
    if(nextProps.league_id){
      this.loadTable(nextProps.league_id);
    } if(nextProps.league){
      this.setState({league: nextProps.league});
    }
  }

  loadTable(league_id){
    if(!this.state || league_id !== this.state.league_id){
       this.setState({
        league_id: league_id
      });
      this.props.dispatch(getLeague(league_id));
    }
  }

	render() {
    var teams = this.state ? this.state.league : null;
    var table;
    if(this.props.loading){
      table = <ReactLoading className="loader" type="spin" color="#444" height='50px' width='50px'/>;
    } else if(teams && teams.length > 0){
      table = <Table striped condensed hover>
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                    <th>P</th>
                    <th>J</th>
                    <th>V</th>
                    <th>E</th>
                    <th>D</th>
                    <th>GM</th>
                    <th>GS</th>
                    <th>AVG</th>
                    <th>F</th>
                  </tr>
                </thead>
                <tbody>
                {
                  teams.map(team => {
                    var home_goal_avg = ((team.home_goals_scored + team.home_goals_against)/team.games).toFixed(2);
                    var away_goal_avg = ((team.away_goals_scored + team.away_goals_against)/team.games).toFixed(2);
                    return(
                      <tr>
                        <td className="align-left">{team.league_pos}</td>
                        <td className="align-left">
                        <a href={team.form_link} target="_blank">{team.name}</a></td>
                        <td>{team.points}</td>
                        <td>{team.games}</td>
                        <td>{team.home_wins}</td>
                        <td>{team.home_draws}</td>
                        <td>{team.home_losses}</td>
                        <td>{team.home_goals_scored}</td>
                        <td>{team.home_goals_against}</td>
                        <td>{home_goal_avg}</td>
                        <td>
                          {
                            team.home_form.map(game => {
                              var color;
                              switch(game){
                                case 'V': color = '#009966'; break;
                                case 'E': color = '#777777'; break;
                                case 'D': color = '#D20000'; break;
                              }
                              var gameStyle = {
                                color: color
                              };
                              return(<span style={gameStyle}>{game}</span>)
                              
                            })
                          }
                        </td>
                        <td>{team.away_wins}</td>
                        <td>{team.away_draws}</td>
                        <td>{team.away_losses}</td>
                        <td>{team.away_goals_scored}</td>
                        <td>{team.away_goals_against}</td>
                        <td>{away_goal_avg}</td>
                        <td>
                          {
                            team.away_form.map(game => {
                              var color;
                              switch(game){
                                case 'V': color = '#009966'; break;
                                case 'E': color = '#777777'; break;
                                case 'D': color = '#D20000'; break;
                              }
                              var gameStyle = {
                                color: color
                              };
                              return(<span style={gameStyle}>{game}</span>)
                              
                            })
                          }
                        </td>
                      </tr>
                    )
                  })
                }
                </tbody>
              </Table>
    }
  	return (
    	<div className="my_table">
        {table}
    	</div>
  	);
  }
}

TableComponent.propTypes = {
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    loading: state.leagueReducer.loading,
    league: state.leagueReducer.league
  };
}

export default connect(mapStateToProps)(TableComponent);