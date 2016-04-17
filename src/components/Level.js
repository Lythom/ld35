import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

class Level extends Component {

  constructor() {
    super();
    this.state = {
      scroll      : 0,
      scrollStart : 0
    };
    setInterval(() => {
      if (this.props.moving) {
        this.setState({
          scroll : this.state.scroll - 3
        });
      } else {
        if (this.state.scrollStart != this.state.scroll) {
          this.setState({
            scrollStart : this.state.scroll
          });
        }
      }
    }, 13)
  }

  render() {

    const {level, levelProgress, nextLock, score, validCells} = this.props;

    var lock = null;

    if (!this.props.moving) {
      lock = <div className="i-bloc locks">
        {
          nextLock.map((lock, i) => <div key={lock+i} className="gem">
            {lock != null ? <img src={'images/'+lock[0]+'.png'} alt=""/> : null}
            {lock != null && lock[1] > 0 ? <img src={'images/'+lock+'.png'} alt=""/> : null}
          </div>)
        }
      </div>;
    }

    var doors = [];
    const spaceBetweenDoors = 230;
    const nbDoors = this.props.leveling ? level - 1 : level;
    const progress = this.props.moving ? this.props.leveling ? this.props.level - 2 : this.props.levelProgress - 1 : this.props.levelProgress;
    for (var i = 0; i < nbDoors; i++) {
      doors.push(<div key={i} className={'door'}
                      style={{transform: 'translate('+(240 + spaceBetweenDoors * (i - progress) + this.state.scroll - this.state.scrollStart)+'px,'+40+'px)'}}></div>)
    }


    return (
      <div className="progress i-bloc" style={{height:160, backgroundPositionX: this.state.scroll}}>
        {doors}
        <div className={'char '+(this.props.moving ? 'char_moving' : '')}></div>
        <span style={{float:'left', fontSize: this.props.leveling ? 50 : 24, transition: "font-size 0.5s"}}>Level {level} ({levelProgress}/{level})</span>
        <span style={{float:'right'}}>{score} Points</span>
        {lock}
      </div>
    )
  }
}

export default connect( // map states and dispatch to props
  (state) => ({
    level         : state.level,
    levelProgress : state.levelProgress,
    nextLock      : state.nextLock,
    score         : state.score,
    validCells    : state.validCells,
    moving        : state.moving,
    leveling      : state.leveling
  })
)(Level)
