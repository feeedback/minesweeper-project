/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
const getRandomInt = (min, max) => Math.floor(min + Math.random() * (max + 1 - min));
const getRandomIndex = (max) => getRandomInt(0, max - 1);

class Minesweeper {
    constructor(x = 9, y = 9, mines = 10) {
        this.x = x;
        this.y = y;
        this.mines = mines;
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
        for (let y = mineY - 1; y <= mineY + 1; y += 1) {
            for (let x = mineX - 1; x <= mineX + 1; x += 1) {
                if (
                    y >= 0 &&
                    y < this.y &&
                    x >= 0 &&
                    x < this.x &&
                    this.field[y][x] !== 9
                ) {
                    this.field[y][x] = this.field[y][x] + 1;
                }
            }
        }
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

    init() {
        // create field ⚪ ⚫ ⬛ ⬜ 🔲 🔳 💣
        this.field = Array.from({ length: this.y }, () => new Array(this.x).fill(0));

        // fill the field with mines
        this._initMines();

        // calculate and fill min counters
        this._calcMines();

        return this.field;
    }

    drawMesh() {
        const statesSymbol = {
            0: '🔳',
            9: '💣',
            1: ' 1  ',
            2: ' 2  ',
            3: ' 3  ',
            4: ' 4  ',
            5: ' 5  ',
            6: ' 6  ',
            7: ' 7  ',
            8: ' 8  ',
        };

        return this.field
            .slice()
            .map((row) => row.map((cell) => `${statesSymbol[cell]}`).join('┊'))
            .join(`\n`)
            .concat('\n'); // ${'-'.repeat(mesh.xMax * 3)}\n
    }
}

const states = {
    0: 'digit0',

    1: 'digit1',
    2: 'digit2',
    3: 'digit3',
    4: 'digit4',
    5: 'digit5',
    6: 'digit6',
    7: 'digit7',
    8: 'digit8',

    9: 'mine',
};

// console.log(instanceMS.drawMesh());

const initCell = (maxX, maxY, field) => {
    const fragment = new DocumentFragment();
    for (let i = 0; i < maxX * maxY; i += 1) {
        const y = (i / maxX) | 0;
        const x = i % maxX;
        const cell = document.createElement('button');
        cell.className = `${states[field[y][x]]} closed`;
        cell.id = i;
        fragment.append(cell);
    }
    return fragment;
};

function mouseoverPress(event) {
    const cell = event.target;
    if (event.which === 1 && cell.classList.contains('closed')) {
        cell.classList.add('pressed');
    }
}
function mouseoutPress(event) {
    const cell = event.target;
    if (event.which === 1 && cell.classList.contains('pressed')) {
        cell.classList.remove('pressed');
    }
}
function openCell(cell) {
    if (cell.classList.contains('closed')) {
        cell.classList.remove('pressed');
        cell.classList.remove('closed');
    }

    if (cell.classList.contains('mine')) {
        // если в ячейке мина
        cell.classList.add('mine-explosion');
        const allCell = [...cell.parentNode.children];
        allCell
            .filter((c) => c.classList.contains('mine'))
            .forEach((c) => {
                c.classList.remove('pressed');
                c.classList.remove('closed');
            });

        allCell.forEach((c) => c.setAttribute('disabled', 'true'));
    }

    return true;
}

function zeroOpen(
    cellZero,
    maxX,
    maxY,
    area8forOpen = new Set(),
    visited0Cells = new Set()
) {
    const zeroY = (cellZero / maxX) | 0;
    const zeroX = cellZero % maxX;
    for (let y = zeroY - 1; y <= zeroY + 1; y += 1) {
        for (let x = zeroX - 1; x <= zeroX + 1; x += 1) {
            if (y >= 0 && y < maxY && x >= 0 && x < maxX) {
                area8forOpen.add(String(x + 1 + y * maxX - 1));
            }
        }
    }
    visited0Cells.add(String(cellZero));
    // document.getElementById(cellZero).setAttribute('disabled', 'true');
    for (const cell of area8forOpen) {
        if (
            document.getElementById(cell).classList.contains('digit0') &&
            visited0Cells.has(cell) === false
        ) {
            return zeroOpen(cell, maxX, maxY, area8forOpen, visited0Cells);
        }
    }
    console.log('once');

    visited0Cells.forEach((c0) =>
        document.getElementById(c0).setAttribute('disabled', 'true')
    );
    return area8forOpen;
}

const _area8 = (cellId, maxX, maxY) => {
    console.log(cellId, maxX, maxY);
    const cellY = (cellId / maxX) | 0;
    const cellX = cellId % maxX;
    console.log(cellX, cellY);
    const area8 = [];
    for (let y = cellY - 1; y <= cellY + 1; y += 1) {
        for (let x = cellX - 1; x <= cellX + 1; x += 1) {
            if (
                y >= 0 &&
                y < maxY &&
                x >= 0 &&
                x < maxX &&
                !(cellX === x && cellY === y)
            ) {
                console.log({ x, y });
                area8.push(x + y * maxX);
            }
        }
    }
    return area8;
};

const click = (cell) => {
    console.log(cell.id);
    const startTime = Date.now();
    console.log(0, 'start');

    if (!cell.classList.contains('digit0')) {
        openCell(cell);
        return true;
    }
    const field = cell.parentNode;
    const maxX = field.dataset.x;
    const maxY = field.dataset.y;
    const area8 = _area8(cell.id, maxX, maxY);
    console.log(area8);
    setTimeout(() => {
        area8.forEach((id) => click(document.getElementById(id)));
    }, 3000);
    return true;
};
function clickHandle(event) {
    const { target: cell } = event;
    return click(cell);
}

function start() {
    // take input value
    const x = Number(document.getElementById('x').value) || 9;
    const y = Number(document.getElementById('y').value) || 9;
    const mines = Number(document.getElementById('mines').value) || 10;

    // init Class object
    const instanceMS = new Minesweeper(x, y, mines);
    instanceMS.init();

    // create DOM field
    const fieldContainer = document.getElementById('field-container');
    fieldContainer.dataset.x = x;
    fieldContainer.dataset.y = y;
    document.documentElement.style.setProperty('--x', x);
    document.documentElement.style.setProperty('--y', y);

    while (fieldContainer.hasChildNodes()) {
        fieldContainer.lastChild.remove();
    }
    fieldContainer.append(initCell(x, y, instanceMS.field));

    // event logic
    // press hint
    fieldContainer.addEventListener('mousedown', mouseoverPress);
    fieldContainer.addEventListener('mouseover', mouseoverPress);
    fieldContainer.addEventListener('mouseout', mouseoutPress);

    // mouse up - click
    fieldContainer.addEventListener('click', clickHandle);
}

function minesMaxCalc() {
    const x = document.getElementById('x');
    const y = document.getElementById('x');
    if (x.value === '' || y.value === '') {
        return false;
    }
    const max =
        document.getElementById('x').value * document.getElementById('y').value - 1;
    document.getElementById('mines').setAttribute('max', max);
}

document.getElementById('form').addEventListener('submit', start);
document.getElementById('mines').addEventListener('focus', minesMaxCalc);
