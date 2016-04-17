import React, {Component, PropTypes} from 'react'
import {version} from '../../package.json';

import {connect} from 'react-redux'

import Grid from './Grid';
import Tools from './Tools'
import Level from './Level'

import {restart} from '../Index'
import {bindActionCreators} from 'redux'


class App extends Component {

  render() {


    return (
      <div className="i-bloc" style={{width:900, height:600}}>
        <h1>M3t4morpho5e</h1>
        <div style={{right:10,position:'absolute',top:10}}>Version {version}</div>
        <div style={{right:10,position:'absolute',top:30}}>Best Score {this.props.bestScore}</div>
        <button className={'restart' + (this.props.mode === 'easy' ? ' selected' : '')} onClick={() => this.props.restart('easy')}>Restart<br/>Easy mode</button>
        <button className={'restart restart-bis' + (this.props.mode === 'hard' ? ' selected' : '')} onClick={() => this.props.restart('hard')}>Restart<br/>Hard mode</button>
        <Level />
        <section className="i-bloc" style={{height: 340}}>
          <Tools/>
          <Grid/>
          <div className="help"></div>
        </section>

      </div>
    )
  }
}

export default connect( // map states and dispatch to props
  (state) => ({
    bestScore : state.bestScore,
    mode      : state.mode
  }),
  (dispatch) => bindActionCreators({
    restart
  }, dispatch)
)(App)
