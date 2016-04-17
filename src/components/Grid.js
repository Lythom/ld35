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

  render() {

    let swappingIndicator = null;
    if (this.props.swapping != null) {
      swappingIndicator = (
        <div className="gem" style={{position:'absolute', top:0, left:0, transform: 'translate('+this.props.swapping.col*64+'px,'+this.props.swapping.row*64+'px)'}}>
          <img src={'images/swapping.png'} alt=""/>
        </div>)
    }

    const tool = this.props.tool;

    return (
      <div className="grid" ref="grid">
        {swappingIndicator}
        {this.props.grid.map(
          (row, iRow) => row.map(
            (cell, iCol) => {
              var isMerging = this.props.merging.find(cell => cell.col == iCol && cell.row == iRow);
              if (cell == null && !isMerging) return null;
              var x = isMerging ? this.props.mergingTo.row * 64 : iRow * 64;
              var y = isMerging ? this.props.mergingTo.col * 64 : iCol * 64;
              var value = isMerging ? isMerging.value : this.props.grid[iRow][iCol];
              return <div id={'img-'+iRow+'-'+iCol} className="gem" key={'img-'+iRow+'-'+iCol}
                          style={{position:'absolute', top:0, left:0, transform: 'translate('+y+'px,'+x+'px)', zIndex: isMerging ? 0 : 1}}>
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
    grid      : state.grid,
    mergingTo : state.mergingTo,
    merging   : state.merging,
    tool      : state.tool,
    swapping  : state.swapping
  }),
  (dispatch) => bindActionCreators({
    place,
    swap
  }, dispatch)
)(Grid)
