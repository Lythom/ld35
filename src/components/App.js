import React, {Component, PropTypes} from 'react'
import {version} from '../../package.json';

export default class App extends Component {


  render() {

    const rows = [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ]

    return (
      <div className="i-bloc" style={{width:900, height:600}}>
        <h1>Morph-3</h1>
        <div className="progress i-bloc" style={{height:130}}>

        </div>
        <section className="i-bloc">
          <table>
            {rows.map(row => <tr>{row.map(cell => <td>{cell}</td>)}</tr>)}
          </table>
        </section>
        <div style={{textAlign:'right'}}>Version {version}</div>
      </div>
    )
  }
}
