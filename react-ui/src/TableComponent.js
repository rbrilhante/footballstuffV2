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
      table = <Table responsive striped condensed hover>
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                    <th>J</th>
                    <th>V</th>
                    <th>E</th>
                    <th>D</th>
                    <th>F</th>
                    <th>Avg Goals Last 5</th>
                  </tr>
                </thead>
                <tbody>
                {
                  teams.map(team => {
                    return(
                      <tr>
                        <td className="align-left">{team.league_pos}</td>
                        <td className="align-left"><a href={team.results_link} target="_blank">{team.name}</a></td>
                        <td>{team.games}</td>
                        <td>{team.wins}</td>
                        <td>{team.draws}</td>
                        <td>{team.losses}</td>
                        <td>
                          {
                            team.form.map(game => {
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
                        <td>{team.avg_goals_last_5}</td>
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