import React from 'react';
import './BoardGame.css';

const mapCellValueToText = {
  0: '',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',

  M: '💣', // mine
  ME: '💣', // mine explosion
  C: '', // '?',  closed cell
  F: '🚩', //  🏴⚑🚩flagged cell
  FW: '✕', // ✕✖❌wrong flagged cell
};
const mapCellValueToClassName = {
  0: 'empty',
  1: 'digit1',
  2: 'digit2',
  3: 'digit3',
  4: 'digit4',
  5: 'digit5',
  6: 'digit6',
  7: 'digit7',
  8: 'digit8',

  M: 'mine',
  ME: 'mine mineExplosion',
  C: 'closed',
  F: 'closed flagged',
  FW: 'flaggedWrong',
};
const mapCellValueToLabel = {
  0: 'empty',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',

  M: 'mine',
  ME: 'explosion mine',
  C: 'closed',
  F: 'flagged',
  FW: 'wrong flagged',
};

const BoardGame = ({ closedField, fieldIsDisable, boardHandles }) => {
  return (
    <div className="fieldContainer" {...boardHandles}>
      {closedField.map((row, y) =>
        row.map((cell, x) => (
          <button
            key={`Cell__${x}_${y}`}
            data-x={x}
            data-y={y}
            className={`Cell ${mapCellValueToClassName[cell]}`}
            disabled={fieldIsDisable[y][x]}
            aria-label={mapCellValueToLabel[cell]}
          >
            {mapCellValueToText[cell]}
          </button>
        ))
      )}
    </div>
  );
};

export default BoardGame;
