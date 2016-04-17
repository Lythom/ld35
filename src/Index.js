import React from 'react'
import {render} from 'react-dom'
import App from './components/App'
import {Provider} from 'react-redux'
import {createStore} from 'redux'
import {immutableMerge} from './immutability'

window.React = React;

const initialState = {
  progress      : 0,
  grid          : [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
  ],
  merging       : [],
  mergingTo     : null,
  score         : 0,
  level         : 6,
  levelProgress : 0,
  nextLock      : ['t1'],
  tool          : 't',
  tCount        : -1,
  swapCount     : 10,
  sCount        : 0,
  pCount        : 0,
  swapping      : null,
  moving        : false,
  leveling      : false
};

const store = createStore(rootReducer, initialState, window.devToolsExtension ? window.devToolsExtension() : undefined);

render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('content')
);

// REDUCER
function rootReducer(state = initialState, action) {
  switch (action.type) {
    case PLACE:
      var shape = state.tool;
      let count = state[state.tool + 'Count'];
      if (count == 0) return state;
      var cell = {col : action.payload.col, row : action.payload.row};
      var newState = immutableMerge(state, ['grid', cell.row, cell.col], shape + '0');
      newState = Object.assign({}, newState, {
        [newState.tool + 'Count'] : count == -1 ? -1 : count - 1
      })
      newState = mergeInState(newState, cell);
      newState = updateLocks(newState);

      return newState;

    case SWAP :
      if (state.swapCount == 0) return state;

      if (state.swapping == null) {
        return Object.assign({}, state, {
          swapping : action.payload
        });
      } else {
        let canSwap1 = canSwap(state.grid, action.payload.col, action.payload.row, state.swapping.col, state.swapping.row);
        let canSwap2 = canSwap(state.grid, state.swapping.col, state.swapping.row, action.payload.col, action.payload.row);
        if (!canSwap1 && !canSwap2) {
          return Object.assign({}, state, {
            swapping : null
          });
        } else {
          var swapCell = canSwap1 ? {col : state.swapping.col, row : state.swapping.row} : {col : action.payload.col, row : action.payload.row};
          // orrvide at cell by former state swap
          var newState2 = immutableMerge(state, ['grid', action.payload.row, action.payload.col], state.grid[state.swapping.row][state.swapping.col]);
          // override at swap by former state cell
          newState2 = immutableMerge(newState2, ['grid', state.swapping.row, state.swapping.col], state.grid[action.payload.row][action.payload.col]);
          newState2 = mergeInState(Object.assign({}, newState2, {swapCount : state.swapCount == -1 ? -1 : state.swapCount - 1, tool : 't'}), swapCell);
          return newState2 = updateLocks(newState2);
        }

      }

    case STOP_MOVING:
      return Object.assign({}, state, {
        moving   : false,
        leveling : false
      });

    case DO_MERGE:
      if (state.merging == null || state.merging.length == 0) return state;
      return Object.assign({}, state, {
        merging   : [],
        mergingTo : null
      });

    case CHANGE_TOOL:
      return Object.assign({}, state, {
        tool : action.payload
      });

    default:
      return state
  }
}

// ACTIONS
export const PLACE = 'PLACE'
export function place(row, col) {
  return {
    type    : PLACE,
    payload : {
      row,
      col
    }
  }
}

export const SWAP = 'SWAP'
export function swap(row, col) {
  return {
    type    : SWAP,
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

export const STOP_MOVING = 'STOP_MOVING'
export function stopMoving() {
  return {
    type : STOP_MOVING
  }
}

export const CHANGE_TOOL = 'CHANGE_TOOL'
export function changeTool(newTool) {
  return {
    type    : CHANGE_TOOL,
    payload : newTool
  }
}

// FUNCTIONS

function updateLocks(state) {

  // calculate valid cells
  var validCells = calcValidCells(state);
  var newState = state;

  // check levelComplete
  const isComplete = isLevelComplete(state.nextLock, validCells.map(cell => cell.value));
  let nextLock = state.nextLock;
  let level = state.level;
  let levelProgress = state.levelProgress;
  let score = state.score;
  let moving = false;
  var leveling = false;
  if (isComplete) {
    levelProgress++;
    score += sum(...validCells.map(cell => calcScore(cell.value)));
    moving = true;
    if (levelProgress >= level) {
      level++;
      levelProgress = 0;
      leveling = true;
      setTimeout(() => {
        store.dispatch(stopMoving())
      }, 3000);
    } else {
      setTimeout(() => {
        store.dispatch(stopMoving())
      }, 1000);
    }

    // remove valid cells
    nextLock.forEach(value => {
      var cellIdx = validCells.findIndex(cell => cell.value === value);
      var cell = validCells[cellIdx];
      validCells = [...validCells.slice(0, cellIdx), ...validCells.slice(cellIdx + 1)];
      newState = immutableMerge(newState, ['grid', cell.row, cell.col], null);
    });

    nextLock = randomizeNextLock(level, score);

    // recalculate valid cells
    validCells = calcValidCells(newState);
  }

  return Object.assign({}, newState, {
    validCells    : validCells,
    nextLock      : nextLock,
    level         : level,
    levelProgress : levelProgress,
    score         : score,
    moving        : moving,
    leveling      : leveling
  });
}

function calcValidCells(state) {
  var validCells = [];
  state.grid.forEach(
    (row, iRow) => row.forEach(
      (content, iCol) => {
        if (state.nextLock.some(value => value === content)) validCells.push({col : iCol, row : iRow, value : content})
      }
    )
  );
  return validCells;
}

function calcScore(value) {
  if (value == null || value.length != 2) return 0;
  var mult = 3;
  var plus = -1;
  if (value[0] == 's') {
    mult = 4;
    plus = 0;
  }
  if (value[0] == 'p') {
    mult = 5;
    plus = 0;
  }
  return mult * Math.pow(3, parseInt(value[1]) + plus);
}

function calcMaxLevel(score, type) {

  var mult = 3;
  var plus = -1;
  if (type == 's') {
    mult = 4;
    plus = 0;
  }
  if (type == 'p') {
    mult = 5;
    plus = 0;
  }
  if ((score / mult) - Math.log(3) < 0) return -1;
  return Math.floor(Math.log((score / mult)) / Math.log(3) - plus);
}

function randomizeNextLock(level, score) {
  var nextLockScore = score * 0.5 + 6;
  var locks = [];

  do {
    let provision = Math.max(nextLockScore * (0.70), 3); // 35%~60% of points foes into the next
    var possiblePieces = [
      {type : 'p', value : calcMaxLevel(provision, 'p')}, // penta
      {type : 's', value : calcMaxLevel(provision, 's')}, // square
      {type : 't', value : calcMaxLevel(provision, 't')} // triangle
    ].filter(piece => piece.value >= 0);

    if (possiblePieces.length > 0) {
      const pieceObj = possiblePieces[Math.floor(Math.random() * possiblePieces.length)];
      const piece = pieceObj.type + pieceObj.value;
      locks.push(piece);
      nextLockScore = nextLockScore - calcScore(piece);
    }
  } while (possiblePieces.length > 0 && locks.length < level && nextLockScore > 3);

  return locks;
}

function isLevelComplete(locks, values) {
  if (locks.length === 0) return true;
  const matchingValueIdx = values.indexOf(locks[0]);
  if (matchingValueIdx === -1) return false;
  return isLevelComplete([...locks.slice(1)], [...values.slice(0, matchingValueIdx), ...values.slice(matchingValueIdx + 1)])
}

function canSwap(grid, c1, r1, c2, r2) {
  if (r1 === c1 && r2 === c2 || grid[r1][c1] == null) return false;
  const previewGrid = immutableMerge(grid, [r2, c2], grid[r1][c1])
  const previewMerge = calcMerge(previewGrid, {col : c2, row : r2})
  return previewMerge.toMerge != null && previewMerge.toMerge.length > 0;
}

function mergeInState(state, cell) {
  var newState = state;
  var mergeData = calcMerge(newState.grid, cell);

  if (mergeData.cellValue != 't0') {
    newState = immutableMerge(newState, ['grid', cell.row, cell.col], mergeData.cellValue);
  }
  if (mergeData.toMerge != null && mergeData.toMerge.length > 0) {
    newState = Object.assign({}, newState, {
        swapping  : null,
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
    setTimeout(() => store.dispatch(doMerge()), 300);
    return newState;
  }
  return newState;
}

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

  if (chain.length === 3 || chain.length > 3 && currentValue[0] !== 't') {
    var updatedValue = levelUp(currentValue);
    return calcMerge(immutableMerge(grid, [cell.row, cell.col], updatedValue), cell, chainToMerge)
  }
  else if (chain.length === 4) {
    var upgradedValue = toSquare(currentValue);
    return calcMerge(immutableMerge(grid, [cell.row, cell.col], upgradedValue), cell, chainToMerge)
  }
  else if (chain.length >= 5) {
    var upgradedValue2 = toPenta(currentValue);
    return calcMerge(immutableMerge(grid, [cell.row, cell.col], upgradedValue2), cell, chainToMerge)
  }
  // end of the combo
  return {cellValue : grid[cell.row][cell.col], toMerge : toMerge}
}

function getChain(grid, fromCell, but) {
  if (grid[fromCell.row][fromCell.col] == null) return [];
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
    {
      col   : fromCell.col,
      row   : fromCell.row - 1,
      value : grid[fromCell.row][fromCell.col]
    }].filter(cell => (butCell == null || cell.col != butCell.col || cell.row != butCell.row) && isValidCellPos(grid, cell))
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
  return "s" + currentValue[1];
}
function toPenta(currentValue) {
  return "p" + currentValue[1];
}

function sum() {
  const list = Array.isArray(arguments[0]) ? arguments[0] : [...arguments];
  return list.length > 0 ? list[0] + sum(...list.slice(1)) : 0;
}
