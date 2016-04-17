import React, {Component, PropTypes} from 'react'
import {version} from '../../package.json';

import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import {changeTool} from '../Index'


class Tools extends Component {

  render() {

    var toolY = 2;
    switch (this.props.tool) {
      case 't':
        toolY = 2;
        break;
      case 'swap':
        toolY = 82;
        break;
      case 's':
        toolY = 162;
        break;
      case 'p':
        toolY = 242;
        break;
    }

    return (
      <div className="preview" style={{backgroundPositionY: toolY}}>
        <div>
          <button className={this.props.tool == 't' ? 'selected' : null} onClick={() => this.props.changeTool('t')}><img src="images/t.png"/></button>
          <div className="quantity" style={this.props.tCount == -1 ? null : {fontSize:24, top:31}}>{this.props.tCount == -1 ? '∞' : '×' + this.props.tCount}</div>
        </div>
        <div>
          <button disabled={this.props.swapCount == 0} className={this.props.tool == 'swap' ? 'selected' : null} onClick={() => this.props.changeTool('swap')}><img src="images/swap.png"/>
            <div className="quantity" style={this.props.swapCount == -1 ? null : {fontSize:24, top:31}}>{this.props.swapCount == -1 ? '∞' : '×' + this.props.swapCount}</div>
          </button>
        </div>
        <div>
          <button disabled={this.props.sCount == 0} className={this.props.tool == 's' ? 'selected' : null} onClick={() => this.props.changeTool('s')}><img src="images/s.png"/></button>
          <div className="quantity" style={this.props.sCount == -1 ? null : {fontSize:24, top:31}}>{this.props.sCount == -1 ? '∞' : '×' + this.props.sCount}</div>
        </div>
        <div>
          <button disabled={this.props.pCount == 0} className={this.props.tool == 'p' ? 'selected' : null} onClick={() => this.props.changeTool('p')}><img src="images/p.png"/></button>
          <div className="quantity" style={this.props.pCount == -1 ?  null : {fontSize:24, top:31}}>{this.props.pCount == -1 ? '∞' : '×' + this.props.pCount}</div>
        </div>
      </div>
    )
  }
}


export default connect( // map states and dispatch to props
  (state) => ({
    tool      : state.tool,
    tCount    : state.tCount,
    swapCount : state.swapCount,
    sCount    : state.sCount,
    pCount    : state.pCount
  }),
  (dispatch) => bindActionCreators({
    changeTool
  }, dispatch)
)(Tools)
