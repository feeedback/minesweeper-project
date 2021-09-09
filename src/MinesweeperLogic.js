const getRandomInt = (min, max) => Math.floor(min + Math.random() * (max + 1 - min));
const getRandomIndex = (max) => getRandomInt(0, max - 1);
const mapDefinitionToSymbol = {
  ZERO_MINES_NEARBY: 0,
  ONE_MINES_NEARBY: 1,
  TWO_MINES_NEARBY: 2,
  THREE_MINES_NEARBY: 3,
  FOUR_MINES_NEARBY: 4,
  FIVE_MINES_NEARBY: 5,
  SIX_MINES_NEARBY: 6,
  SEVEN_MINES_NEARBY: 7,
  EIGHT_MINES_NEARBY: 8,

  CELL_CLOSED: 'C',
  MINE: 'M',
  MINE_EXPLOSION: 'ME',
  FLAG: 'F',
  FLAG_IN_WRONG_POSITION: 'FW',
};

class Minesweeper {
  constructor(x = 9, y = 9, mines = 10) {
    if (mines > x * y) {
      throw new Error('ERROR: mines more than cell');
    }
    this.x = x;
    this.y = y;
    this.mines = mines;

    this.field = [];
    this.closedField = [];

    this.leftFlags = mines;
    this.leftClosed = x * y;

    this.gameState = 'non-started';
    this.mapDefinitionToSymbol = mapDefinitionToSymbol;
  }

  _initMines() {
    let tailMines = this.mines;
    while (tailMines !== 0) {
      const x = getRandomIndex(this.x);
      const y = getRandomIndex(this.y);

      if (this.field[y][x] !== mapDefinitionToSymbol.MINE) {
        this.field[y][x] = mapDefinitionToSymbol.MINE;
        tailMines -= 1;
      }
    }
  }

  _getArea8(cellX, cellY) {
    const area8 = [];
    for (let y = cellY - 1; y <= cellY + 1; y += 1) {
      for (let x = cellX - 1; x <= cellX + 1; x += 1) {
        if (y >= 0 && y < this.y && x >= 0 && x < this.x && !(cellX === x && cellY === y)) {
          area8.push({ x, y });
        }
      }
    }
    return area8;
  }

  _getArea8Closed(cellX, cellY, area8 = this._getArea8(cellX, cellY)) {
    return area8.filter(({ x, y }) => this.closedField[y][x] === mapDefinitionToSymbol.CELL_CLOSED);
  }
  _getArea8Flagged(cellX, cellY, area8 = this._getArea8(cellX, cellY)) {
    return area8.filter(({ x, y }) => this.closedField[y][x] === mapDefinitionToSymbol.FLAG);
  }

  _increaseMineCounterInArea8(mineX, mineY) {
    this._getArea8(mineX, mineY).forEach(({ x, y }) => {
      const cellValue = this.field[y][x];
      if (cellValue !== mapDefinitionToSymbol.MINE) {
        this.field[y][x] = cellValue + 1;
      }
    });
  }

  _calculateMinesAndSetCounterValues() {
    this.field.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell === mapDefinitionToSymbol.MINE) {
          this._increaseMineCounterInArea8(x, y);
        }
      })
    );
  }

  _initFieldAndFillValue(value) {
    return Array.from({ length: this.y }, () => new Array(this.x).fill(value));
  }

  init() {
    this.closedField = this._initFieldAndFillValue(mapDefinitionToSymbol.CELL_CLOSED);
    this.field = this._initFieldAndFillValue(mapDefinitionToSymbol.ZERO_MINES_NEARBY);
    this._initMines();
    this._calculateMinesAndSetCounterValues();
    this.gameState = 'playing';
  }

  _markAllWrongFlag() {
    this.closedField.forEach((row, y) =>
      row.forEach((closedCellValue, x) => {
        if (
          closedCellValue === mapDefinitionToSymbol.FLAG &&
          this.field[y][x] !== mapDefinitionToSymbol.MINE
        ) {
          this.closedField[y][x] = mapDefinitionToSymbol.FLAG_IN_WRONG_POSITION;
        }
      })
    );
  }

  _markAllTailClosedFlag() {
    this.closedField.forEach((row, y) =>
      row.forEach((closedCellValue, x) => {
        if (
          closedCellValue === mapDefinitionToSymbol.CELL_CLOSED &&
          this.field[y][x] === mapDefinitionToSymbol.MINE
        ) {
          this.closedField[y][x] = mapDefinitionToSymbol.FLAG;
        }
      })
    );
  }

  _showAllClosedMine() {
    this.closedField.forEach((row, y) =>
      row.forEach((closedCellValue, x) => {
        if (
          closedCellValue === mapDefinitionToSymbol.CELL_CLOSED &&
          this.field[y][x] === mapDefinitionToSymbol.MINE
        ) {
          this.closedField[y][x] = mapDefinitionToSymbol.MINE;
        }
      })
    );
  }

  _exitLoseExplosion(x, y) {
    // console.log('💣Explosion💣! GAME OVER');
    this.closedField[y][x] = mapDefinitionToSymbol.MINE_EXPLOSION;
    this._markAllWrongFlag();
    this._showAllClosedMine();
    this.gameState = 'lose';
  }

  _exitWinAllOpened() {
    this._markAllTailClosedFlag();
    // console.log('All opened!  You win!🏆');
    this.gameState = 'win';
  }

  _openCell(x, y) {
    this.leftClosed -= 1;
    this.closedField[y][x] = this.field[y][x];
  }

  stepToOpenCell(x, y) {
    const timeStart = Date.now();
    let status = 'OPENING';
    const opened = new Set();
    const queuePositions = [{ x, y }];

    while (queuePositions.length > 0 || status !== 'OPENING') {
      const position = queuePositions.shift();
      if (!position) {
        continue;
      }
      const { x, y } = position;
      opened.add(`${x},${y}`);

      if (this.closedField[y][x] !== mapDefinitionToSymbol.CELL_CLOSED) {
        continue;
      }
      this._openCell(x, y);
      if (this.field[y][x] === mapDefinitionToSymbol.MINE) {
        this._exitLoseExplosion(x, y);
        break;
      }
      // остались закрытыми только мины
      if (this.leftClosed === this.leftFlags) {
        this._exitWinAllOpened();
        break;
      }

      if (this.field[y][x] === mapDefinitionToSymbol.ZERO_MINES_NEARBY) {
        const areaNoOpened = this._getArea8Closed(x, y).filter(({ x, y }) => {
          const isHasNot = !opened.has(`${x},${y}`);
          if (isHasNot) {
            opened.add(`${x},${y}`);
          }
          return isHasNot;
        });
        queuePositions.push(...areaNoOpened);
      }
    }

    console.log('stepToOpenCell ( x', x, ', y', y, ') end: ', Date.now() - timeStart, 'ms');
  }

  _setFlag(x, y) {
    this.leftFlags -= 1;
    this.leftClosed -= 1;
    this.closedField[y][x] = mapDefinitionToSymbol.FLAG;
    // console.log('FLAG THE MINE 🚩', x, y);
  }

  _removeFlag(x, y) {
    this.leftFlags += 1;
    this.leftClosed += 1;
    this.closedField[y][x] = mapDefinitionToSymbol.CELL_CLOSED;
    // console.log('DELETE FLAG X🚩', x, y);
  }

  setOrRemoveFlag(x, y) {
    if (this.closedField[y][x] === mapDefinitionToSymbol.CELL_CLOSED && this.leftFlags > 0) {
      this._setFlag(x, y);
    } else if (this.closedField[y][x] === mapDefinitionToSymbol.FLAG) {
      this._removeFlag(x, y);
    }
  }

  ifSafeSpaceOpenArea8(x, y) {
    // console.log('_checkIsThisSafeCell', x, y);
    const cellValue = this.closedField[y][x];
    if (!Number.isInteger(cellValue) || cellValue === mapDefinitionToSymbol.ZERO_MINES_NEARBY) {
      return;
    }
    const area8 = this._getArea8(x, y);
    const areaFlagged = this._getArea8Flagged(x, y, area8);
    const areaClosed = this._getArea8Closed(x, y, area8);

    if (cellValue === areaFlagged.length) {
      for (const { x: areaX, y: areaY } of areaClosed) {
        this.stepToOpenCell(areaX, areaY);
      }
    }
  }
  getNearestNotZeroCell(currentX, currentY) {
    if (
      !this.closedField[currentY] ||
      this.closedField[currentY][currentX] !== mapDefinitionToSymbol.ZERO_MINES_NEARBY
    ) {
      return null;
    }

    const notZeroCellsWithDistance = [];
    const getDistance = (x, y) => Math.sqrt((x - currentX) ** 2 + (y - currentY) ** 2);

    this.closedField.forEach((row, y) =>
      row.forEach((cellValue, x) => {
        if (cellValue !== mapDefinitionToSymbol.ZERO_MINES_NEARBY) {
          notZeroCellsWithDistance.push({ x, y, distance: getDistance(x, y) });
        }
      })
    );
    if (notZeroCellsWithDistance.length === 0) {
      return null;
    }

    const [nearestCell] = notZeroCellsWithDistance.sort((a, b) => a.distance - b.distance);
    return nearestCell;
  }
}

export default Minesweeper;
