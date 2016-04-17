import React, {Component, PropTypes} from 'react'
import {version} from '../../package.json';

import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import {changeTool} from '../Index'

const initState = {
  t    : 0,
  s    : 0,
  p    : 0,
  swap : 0
};

class Tools extends Component {

  constructor() {
    super();
    this.animating = false;
    this.state = initState
  }

  componentWillReceiveProps(nextProps) {
    if (!this.animating && nextProps.loot.length > 0) {
      this.animating = true;
      var that = this;
      nextProps.loot.forEach((tool, i) => {
        setTimeout(function() {
          that.setState({
            [tool] : that.state[tool] + 1
          })
        }, i * 2000 / nextProps.loot.length)
      });
      setTimeout(function() {
        that.animating = false;
        that.setState(initState)
      }, 3000);
    }
  }

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
          <div className="quantity"
               style={this.props.tCount == -1 ? null : {fontSize:24 + this.state.t * 5, top:31}}>{this.props.tCount == -1 ? '∞' : '×' + this.props.tCount}{this.state.t > 0 ? '+' + this.state.t : ''}</div>
        </div>
        <div>
          <button disabled={this.props.swapCount + this.state.swap == 0} className={this.props.tool == 'swap' ? 'selected' : null} onClick={() => this.props.changeTool('swap')}>
            <img
              src="images/swap.png"/>
            <div className="quantity"
                 style={this.props.swapCount == -1 ? null : {fontSize:24 + this.state.swap * 5, top:31}}>{this.props.swapCount == -1 ? '∞' : '×' + this.props.swapCount}{this.state.swap > 0 ? '+' + this.state.swap : ''}</div>
          </button>
        </div>
        <div>
          <button disabled={this.props.sCount + this.state.s == 0} className={this.props.tool == 's' ? 'selected' : null} onClick={() => this.props.changeTool('s')}><img
            src="images/s.png"/>
          </button>
          <div className="quantity"
               style={this.props.sCount == -1 ? null : {fontSize:24 + this.state.s * 5, top:31}}>{this.props.sCount == -1 ? '∞' : '×' + this.props.sCount}{this.state.s > 0 ? '+' + this.state.s : ''}</div>
        </div>
        <div>
          <button disabled={this.props.pCount + this.state.p == 0} className={this.props.tool == 'p' ? 'selected' : null} onClick={() => this.props.changeTool('p')}><img
            src="images/p.png"/>
          </button>
          <div className="quantity"
               style={this.props.pCount == -1 ?  null : {fontSize:24 + this.state.p * 5, top:31}}>{this.props.pCount == -1 ? '∞' : '×' + this.props.pCount}{this.state.p > 0 ? '+' + this.state.p : ''}</div>
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
    pCount    : state.pCount,
    loot      : state.loot
  }),
  (dispatch) => bindActionCreators({
    changeTool
  }, dispatch)
)(Tools)
