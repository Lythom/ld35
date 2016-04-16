import React from 'react';
import {render} from 'react-dom';
import App from './components/App';
import {Provider} from 'react-redux'
import {createStore} from 'redux'

import {immutableMerge} from './immutability';

window.React = React;

const initialState = {
  progress  : 0,
  grid      : [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
  ],
  merging   : [],
  mergingTo : null,
  score     : 0
};

const store = createStore(rootReducer, initialState, window.devToolsExtension ? window.devToolsExtension() : undefined);

render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('content')
);

// REDUCER
function rootReducer(state = initialState, action) {
  switch (action.type) {
    case PLACE_TRIANGLE:
      var cell = {col : action.payload.col, row : action.payload.row};
      var newState = immutableMerge(state, ['grid', action.payload.row, action.payload.col], 'T0');
      var mergeData = calcMerge(newState.grid, cell);

      if (mergeData.cellValue != 'T0') {
        newState = immutableMerge(newState, ['grid', action.payload.row, action.payload.col], mergeData.cellValue);
      }
      if (mergeData.toMerge != null && mergeData.toMerge.length > 0) {
        newState = Object.assign({}, newState, {
            merging   : mergeData.toMerge,
            mergingTo : cell,
            grid      : newState.grid.map(
              (row, iRow) => row.map(
                (col, iCol) =>
                  // nullify any merged cell
                  mergeData.toMerge.some(gridCell => gridCell.col == iCol && gridCell.row == iRow) ? null : newState.grid[iRow][iCol]
              ))
          }
        );
        setTimeout(() => store.dispatch(doMerge()), 500);
      }
      return newState;

    case DO_MERGE:
      console.log("domerge" + JSON.stringify(state, null, 2));
      if (state.merging == null || state.merging.length == 0) return state;
      console.log("yes");
      return Object.assign({}, state, {
        merging   : [],
        mergingTo : null
      });

    default:
      return state
  }
}

// ACTIONS
export const PLACE_TRIANGLE = 'PLACE_TRIANGLE'
export function placeTriangle(row, col) {
  return {
    type    : PLACE_TRIANGLE,
    payload : {
      row,
      col
    }
  }
}

export const DO_MERGE = 'DO_MERGE'
export function doMerge() {
  return {
    type : DO_MERGE
  }
}

// FUNCTIONS

// returns {cellValue: <mergedValue>, toMerge: Array.<Cell>}
function calcMerge(grid, cell, toMerge) {
  var chain = getChain(grid, cell);
  var chainToMerge = chain.filter(c => c.col != cell.col || c.row != cell.row);
  if (toMerge != null) {
    chainToMerge = [...chainToMerge, ...toMerge]
  }
  var currentValue = grid[cell.row][cell.col];
  if (currentValue === null) {
    return {cellValue : null, toMerge : []};
  }

  if (chain.length === 3 || chain.length > 3 && currentValue[0] !== 'T') {
    var updatedValue = levelUp(currentValue);
    return calcMerge(immutableMerge(grid, [cell.row, cell.col], updatedValue), cell, chainToMerge)
  }
  else if (chain.length === 4) {
    var upgradedValue = toSquare(currentValue);
    return calcMerge(immutableMerge(grid, [cell.row, cell.col], upgradedValue), cell, chainToMerge)
  }
  else if (chain.length === 5) {
    var upgradedValue2 = toPenta(currentValue);
    return calcMerge(immutableMerge(grid, [cell.row, cell.col], upgradedValue2), cell, chainToMerge)
  }
  // end of the combo
  return {cellValue : grid[cell.row][cell.col], toMerge : toMerge}
}

function getChain(grid, fromCell, but) {
  var adjCells = getAdjCells(grid, fromCell, but);
  var sameAdjCells = adjCells.filter(adjCell => grid[fromCell.row][fromCell.col] === grid[adjCell.row][adjCell.col]);
  if (sameAdjCells == null) {
    return [fromCell]
  } else {
    return [fromCell, ...[].concat(...sameAdjCells.map(cell => getChain(grid, cell, fromCell)))]
  }
}

function getAdjCells(grid, fromCell, butCell) {
  return [
    {col : fromCell.col - 1, row : fromCell.row, value : grid[fromCell.row][fromCell.col]},
    {col : fromCell.col + 1, row : fromCell.row, value : grid[fromCell.row][fromCell.col]},
    {col : fromCell.col, row : fromCell.row + 1, value : grid[fromCell.row][fromCell.col]},
    {col : fromCell.col, row : fromCell.row - 1, value : grid[fromCell.row][fromCell.col]}].filter(cell => (butCell == null || cell.col != butCell.col || cell.row != butCell.row) && isValidCellPos(grid, cell))
}

function isValidCellPos(grid, cellPos) {
  const cCount = columnCount(grid)
  const rCount = rowCount(grid)
  return (cellPos != null
  && cellPos.col != null && cellPos.row != null
  && cellPos.col >= 0 && cellPos.row >= 0
  && cCount != null && cCount > cellPos.col
  && rCount != null && rCount > cellPos.row)
}
function rowCount(grid) {
  if (Array.isArray(grid)) {
    return grid.length
  }

  return null
}
export function columnCount(grid) {
  const rCount = rowCount(grid)
  if (rCount != null && rCount > 0 && Array.isArray(grid[0])) {
    return grid[0].length
  }

  return null
}

// value is <Type><Level> where Type is one letter id, and Level is one numeric level
function levelUp(currentValue) {
  return currentValue[0] + (parseInt(currentValue[1]) + 1).toString();
}
function toSquare(currentValue) {
  return "S" + currentValue[1];
}
function toPenta(currentValue) {
  return "P" + currentValue[1];
}

