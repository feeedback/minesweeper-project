const getRandomInt = (min, max) => Math.floor(min + Math.random() * (max + 1 - min));
const getRandomIndex = (max) => getRandomInt(0, max - 1);

class Minesweeper {
    constructor(x = 9, y = 9, mines = 10) {
        if (mines > x * y) {
            throw new Error('ERROR: mines more than cell');
        }
        this.x = x;
        this.y = y;
        this.mines = mines;
        this.leftFlags = mines;
        this.leftClosed = x * y;
        this.state = 'playing';
    }

    _initMines() {
        let tail = this.mines;
        while (tail !== 0) {
            const mineIndex = getRandomIndex(this.x * this.y);
            const mineY = (mineIndex / this.x) | 0;
            const mineX = mineIndex % this.x;

            if (this.field[mineY][mineX] !== 9) {
                this.field[mineY][mineX] = 9;
                tail -= 1;
            }
        }
        return true;
    }

    _incMineCounter(mineX, mineY) {
        this._getArea8(mineX, mineY).forEach(({ x, y }) => {
            const cell = this.field[y][x];
            if (cell !== 9) {
                this.field[y][x] = cell + 1;
            }
        });
    }

    _calcMines() {
        this.field.forEach((row, y) =>
            row.forEach((cell, x) => {
                if (cell === 9) {
                    this._incMineCounter(x, y);
                }
            })
        );
    }

    _initClosedField() {
        this.closedField = this.field.map((row) => row.map(() => '?'));
        return this;
    }

    init() {
        // create field ⚪ ⚫ ⬛ ⬜ 🔲 🔳 💣
        this.field = Array.from({ length: this.y }, () => new Array(this.x).fill(0));

        // fill the field with mines
        this._initMines();

        // calculate and fill min counters
        this._calcMines();

        // init closed field
        this._initClosedField();

        return this;
    }

    drawMesh(fieldType = 'open') {
        const field = fieldType === 'closed' ? this.closedField : this.field;

        const statesSymbol = {
            0: '    ⬛ ',
            9: '💣',
            1: ' 1  ',
            2: ' 2  ',
            3: ' 3  ',
            4: ' 4  ',
            5: ' 5  ',
            6: ' 6  ',
            7: ' 7  ',
            8: ' 8  ',
            '?': '🔳',
            F: '🚩',
        };

        return field
            .map((row) => row.map((cell) => `${statesSymbol[cell]}`).join('┊'))
            .join(`\n`)
            .concat('\n');
    }

    openCell(x, y) {
        if (this.closedField[y][x] !== '?') {
            return false;
        }
        this.leftClosed -= 1;
        this.closedField[y][x] = this.field[y][x];

        const cells = [{ x, y }];
        if (this.field[y][x] === 0) {
            return this._zeroOpen(x, y);
        }
        while (cells.length !== 0) {
            const { x: zeroX, y: zeroY } = cells.shift();
            this.closedField[zeroY][zeroX] = this.field[zeroY][zeroX];

            const area8Closed = this._getArea8Closed(zeroX, zeroY);
            // for (const { x, y } of area8Closed) {
            //     if (this.field[y][x] === 0) {
            //         zeroCells.push({ x, y });
            //     }

            //     this.closedField[y][x] = this.field[y][x];
            // }
            for (const { x, y } of area8Closed) {
                return this.openCell(x, y);
            }
        }
        if (this.field[y][x] === 0) {
            return this._zeroOpen(x, y);
        }
        return true;
    }

    _zeroOpen(zeroX, zeroY) {
        const area8Closed = this._getArea8Closed(zeroX, zeroY);
        for (const { x, y } of area8Closed) {
            return this.openCell(x, y);
        }
        return true;
    }

    _isRightOpened() {
        return this.field.every((row, y) =>
            row.every((cell, x) => {
                if (cell === 9) {
                    return this.closedField[y][x] === 'F';
                }
                return true;
            })
        );
    }
    _markAllWrongFlag() {
        this.closedField.map((row, y) =>
            row.map((cell, x) => (cell === 'F' && this.field[y][x] !== 9 ? 'FW' : cell))
        );
    }

    step(x = getRandomIndex(this.x), y = getRandomIndex(this.y)) {
        // step(x, y) {
        // if (this.closedField[y][x] !== '?') {
        //     console.log(this.drawMesh('closed'));
        //     // return this.step();
        // }

        console.log('step: ', x, y);
        this.openCell(x, y);
        console.log(this.drawMesh('closed'));

        if (this.field[y][x] === 9) {
            console.log('💣Explosion💣! GAME OVER');
            this.closedField[y][x] = 'ME';
            this._markAllWrongFlag();
            return 'lose';
        }

        if (this.leftClosed === 0) {
            console.log('all opened');
            if (this._isRightOpened()) {
                console.log('🏆correctly! You win!🏆');
                return 'win';
            } else {
                this._markAllWrongFlag();
                console.log('Wrong! You lose!');
                return 'lose';
            }
        }

        // this._findSafeToOpenCell();
        // this._findMineWithoutFlag();
        // this._findSafeToOpenCell();

        // return this.step();
    }

    _getArea8(cellX, cellY) {
        const area8 = [];
        for (let y = cellY - 1; y <= cellY + 1; y += 1) {
            for (let x = cellX - 1; x <= cellX + 1; x += 1) {
                if (
                    y >= 0 &&
                    y < this.y &&
                    x >= 0 &&
                    x < this.x &&
                    !(cellX === x && cellY === y)
                ) {
                    area8.push({ x, y });
                }
            }
        }
        return area8;
    }

    // _getArea8Closed(cellX, cellY) {
    //     const area = this._getArea8(cellX, cellY);
    //     return area.filter(({ x, y }) => this.closedField[y][x] === '?');
    // }

    // _getArea8Flagged(cellX, cellY) {
    //     const area = this._getArea8(cellX, cellY);
    //     return area.filter(({ x, y }) => this.closedField[y][x] === 'F');
    // }

    // _findMineWithoutFlag() {
    //     for (let y = 0; y < this.y; y += 1) {
    //         for (let x = 0; x < this.x; x += 1) {
    //             const area = this._getArea8Flagged(x, y);
    //             const areaFlagged = this._getArea8Flagged(x, y, area);
    //             const areaClosed = this._getArea8Closed(x, y);
    //             const cell = this.closedField[y][x];

    //             if (
    //                 Number.isInteger(cell) &&
    //                 areaClosed.length &&
    //                 cell === areaClosed.length + areaFlagged.length
    //             ) {
    //                 areaClosed.forEach(({ x, y }) => this.markMine(x, y));
    //             }
    //         }
    //     }
    //     return false;
    // }

    // markMine(x, y) {
    //     this.closedField[y][x] = 'F';
    //     this.leftClosed -= 1;
    //     this.leftFlags -= 1;
    //     console.log('FLAG THE MINE 🚩', x, y);
    //     console.log(this.drawMesh('closed'));
    //     return true;
    // }
    // _ifSafeSpaceOpenArea8(x, y) {
    //     console.log('_checkIsThisSafeCell', x, y);

    //     const area = this._getArea8Flagged(x, y);
    //     const areaFlagged = this._getArea8Flagged(x, y, area);
    //     const areaClosed = this._getArea8Closed(x, y);
    //     const cellValue = this.closedField[y][x];

    //     if (
    //         Number.isInteger(cellValue) &&
    //         areaClosed.length &&
    //         cellValue === areaFlagged.length
    //     ) {
    //         areaClosed.forEach(({ x, y }) => this.openCell(x, y));
    //         return true;
    //     }
    //     return false;
    // }
    // _findSafeToOpenCell() {
    //     for (let y = 0; y < this.y; y += 1) {
    //         for (let x = 0; x < this.x; x += 1) {
    //             if (Number.isInteger(this.closedField[y][x])) {
    //                 this._ifSafeSpaceOpenArea8(x, y);
    //             }
    //         }
    //     }
    //     return true;
    // }
}

const loop = (x, y, mines) => {
    const newGame = new Minesweeper(x, y, mines);
    newGame.init();
    console.log(newGame.drawMesh());

    newGame.step();
};
loop(3, 3, 1);

// export default Minesweeper;
/*
1. Если есть ЦИФРЫ, вокруг которых за вычетом количества помеченных МИН получается 0,
(количество ФЛАЖКОВ в области равно ЦИФРЕ)
 но есть не открытые клетки - там нет мин - ОТКРЫТЬ эти клетки 
2. Если есть ЦИФРЫ, вокруг которых за вычетом количества помеченных МИН 
получается 1 - там МИНА - пометить ёё ФЛАЖКОМ  (в цикле)
*/
