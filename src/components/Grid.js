import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {place, swap} from '../Index.js';

class Grid extends Component {

  clickCell(iRow, iCol) {
    switch (this.props.tool) {
      case 't':
      case 's':
      case 'p':
        this.props.place(iRow, iCol);
        break;
      case 'swap':
        this.props.swap(iRow, iCol);
        break;
    }
  }

  constructor() {
    super();
    this.state = {
      trick : 0
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.moving && !this.props.moving) {
      this.state.trick = 1;
      var that = this;
      setTimeout(function(){
        that.setState({
          trick: 0
        })
      },80)
      setTimeout(function(){
        that.setState({
          trick: 2
        })
      },1000)
      setTimeout(function(){
        that.setState({
          trick: 0
        })
      },3000)
    }
  }

  render() {

    let swappingIndicator = null;
    if (this.props.swapping != null) {
      swappingIndicator = (
        <div className="gem" style={{position:'absolute', top:0, left:0, transform: 'translate('+this.props.swapping.col*64+'px,'+this.props.swapping.row*64+'px)'}}>
          <img src={'images/swapping.png'} alt=""/>
        </div>)
    }

    let validCellsIndicator = null;
    var validCells = this.props.validCells;
    if (validCells.length > 0 && this.state.trick != 2) {
      validCellsIndicator = validCells.map((cell, i) => {
        var y = this.props.moving && (i < validCells.length - 1 || this.state.trick != 1) ? -2 * 64 : cell.row * 64;
        var x = this.props.moving && (i < validCells.length - 1 || this.state.trick != 1) ? -2 * 64 : cell.col * 64;
        var value = cell.value;
        return <div className="gem slow" key={'valid-'+cell.row+'-'+cell.col} style={{position:'absolute', top:0, left:0, transform: 'translate('+x+'px,'+y+'px)'}}>
          {!this.props.moving ? <img src="images/valid.png" alt=""/> : null}
          {this.props.moving && value != null ? <img src={'images/'+value[0]+'.png'} alt=""/> : null}
          {this.props.moving && value != null && value[1] > 0 ? <img src={'images/'+value+'.png'} alt=""/> : null}
        </div>
      });
    }

    const tool = this.props.tool;

    return (
      <div className="grid" ref="grid">
        {swappingIndicator}
        {validCellsIndicator}
        {this.props.grid.map(
          (row, iRow) => row.map(
            (cell, iCol) => {
              var isMerging = this.props.merging.find(cell => cell.col == iCol && cell.row == iRow);
              if (cell == null && !isMerging) return null;
              var y = isMerging ? this.props.mergingTo.row * 64 : iRow * 64;
              var x = isMerging ? this.props.mergingTo.col * 64 : iCol * 64;
              var value = isMerging ? isMerging.value : this.props.grid[iRow][iCol];
              return <div id={'img-'+iRow+'-'+iCol} className="gem" key={'img-'+iRow+'-'+iCol}
                          style={{position:'absolute', top:0, left:0, transform: 'translate('+x+'px,'+y+'px)', zIndex: isMerging ? 0 : 1}}>
                {value != null ? <img src={'images/'+value[0]+'.png'} alt=""/> : null}
                {value != null && value[1] > 0 ? <img src={'images/'+value+'.png'} alt=""/> : null}
              </div>
            }
          ))}
        <table>
          <tbody>
          {this.props.grid.map(
            (row, iRow) => <tr key={'row-'+iRow}>
              {row.map(
                (cell, iCol) => (
                  (cell === null || tool === 'swap') ? <td key={'cell-'+iRow+'-'+iCol} onMouseDown={() => this.clickCell(iRow, iCol)} style={{cursor:'pointer'}}/> :
                    <td key={'cell-'+iRow+'-'+iCol}/>
                ))}
            </tr>)}
          </tbody>
        </table>
      </div>
    )
  }
}

export default connect( // map states and dispatch to props
  (state) => ({
    grid       : state.grid,
    mergingTo  : state.mergingTo,
    merging    : state.merging,
    tool       : state.tool,
    swapping   : state.swapping,
    validCells : state.validCells,
    moving     : state.moving
  }),
  (dispatch) => bindActionCreators({
    place,
    swap
  }, dispatch)
)(Grid)
