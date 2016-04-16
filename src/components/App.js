import React, {Component, PropTypes} from 'react'
import {version} from '../../package.json';
import Grid from './Grid';

export default class App extends Component {

  render() {

    return (
      <div className="i-bloc" style={{width:900, height:600}}>
        <h1>M3t4morpho5e</h1>
        <div className="progress i-bloc" style={{height:130}}>

        </div>
        <section className="i-bloc">
          <div className="preview"><img src="images/t.png" /></div>
          <Grid/>
        </section>
        <div style={{textAlign:'right'}}>Version {version}</div>
      </div>
    )
  }
}
