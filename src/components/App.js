import React, {Component, PropTypes} from 'react'
import {version} from '../../package.json';

import {connect} from 'react-redux'

import Grid from './Grid';
import Tools from './Tools'
import Level from './Level'


class App extends Component {

  render() {


    return (
      <div className="i-bloc" style={{width:900, height:600}}>
        <h1>M3t4morpho5e</h1>
        <div style={{right:10,position:'absolute',top:10}}>Version {version}</div>
        <div style={{right:10,position:'absolute',top:30}}>Best Score {this.props.bestScore}</div>
        <Level />
        <section className="i-bloc">
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
    bestScore : state.bestScore
  })
)(App)
