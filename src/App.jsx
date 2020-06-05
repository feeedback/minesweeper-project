/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import './App.css';
import FormInitGame from './components/FormInitGame.jsx';
import BoardGame from './components/BoardGame.jsx';
import MinesweeperLogic from './MinesweeperLogic';

// TODO: Добавить управление по стрелочкам в 4 направления, от ячейки с фокусом
// TODO: Добавить функцию ИИ авто-прохождения или частичного (только открытие безопасных, либо только флажки)

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameProcessState: 'no-game',
            closedField: [],
            // activeCell: { x: 0, y: 0 },
        };
        this.boardEl = React.createRef();
    }

    _updateState = () => {
        this.setState({
            gameProcessState: this.game.gameState,
            closedField: this.game.closedField,
        });
    };

    _handleStartNewGame = (columnsCount, rowsCount, minesCount) => {
        this.game = new MinesweeperLogic(columnsCount, rowsCount, minesCount);
        this.game.init();

        document.documentElement.style.setProperty('--x', columnsCount);
        document.documentElement.style.setProperty('--y', rowsCount);

        this._updateState();
    };

    handleClick = (event) => {
        const { target } = event;

        if (!target.classList.contains('Cell')) {
            return false;
        }
        // Ctrl + Space for mark Flag on keyboard
        if (event.ctrlKey) {
            return this.handleContextMenu(event);
        }
        // Shift + Space for open Safe Area8 on keyboard
        if (event.shiftKey) {
            return this.handleMouseDown(event);
        }

        const { x, y } = target.dataset;
        this.game.stepToOpenCell(Number(x), Number(y));
        this._updateState();
        // this.setState({ activeCell: { x, y } });
    };

    // componentDidUpdate(prevProps) {
    //     const {
    //         activeCell: { x: currentX, y: currentY },
    //         closedField,
    //     } = this.state;        
    //     const { x: maxX, y: maxY } = this.game;
    //     // const nextCell = target.parentElement.children[x + y * maxX];        
    //     // if (closedField[y][x] === this.game.mapDefinitionToSymbol.ZERO_MINES_NEARBY){}
    //     // while (
    //     //     closedField[y][x] === this.game.mapDefinitionToSymbol.ZERO_MINES_NEARBY &&
    //     //     currentCellEl.nextElementSibling
    //     // ) {
    //     //     currentCellEl = currentCellEl.nextElementSibling;
    //     // }
    //     // while (currentCellEl.disabled && currentCellEl.previousElementSibling) {
    //     //     currentCellEl = currentCellEl.previousElementSibling;
    //     // }
    //     const mapKeyToMoveDirection = {
    //         ArrowUp: (x, y) => [x, y - 1],
    //         ArrowDown: (x, y) => [x, y + 1],
    //         ArrowLeft: (x, y) => [x - 1, y],
    //         ArrowRight: (x, y) => [x + 1, y],
    //     };
    //     const move = (x, y, count = 0) => {
    //         if (count > Math.max(maxX, maxY)) {
    //             return;
    //         }
    //         const [nextX, nextY] = mapKeyToMoveDirection[key](Number(x), Number(y));
    //         if (nextX < 0 || nextX >= maxX || nextY < 0 || nextY >= maxY) {
    //             return;
    //         }
    //         const nextCell = target.parentElement.children[nextX + nextY * maxX];
    //         if (nextCell.disabled) {
    //             return move(nextX, nextY, count + 1);
    //         }
    //         nextCell.focus();
    //     };
    //     move(currentX, currentY);
    //     currentCellEl.focus();
    // }

    handleContextMenu = (event) => {
        event.preventDefault();
        const { target } = event;

        if (!target.classList.contains('Cell')) {
            return false;
        }

        const { x, y } = target.dataset;
        this.game.setOrRemoveFlag(Number(x), Number(y));
        this._updateState();
    };

    handleMouseDown = ({ target, button }) => {
        if (!target.classList.contains('Cell') || button !== 0) {
            return;
        }

        const { x, y } = target.dataset;
        this.game.ifSafeSpaceOpenArea8(Number(x), Number(y));
        this._updateState();
    };

    onKeyDown = (event) => {
        console.log(event.target);
        console.log(document.activeElement);
        const { target, key } = event;
        const { x: maxX, y: maxY } = this.game;
        const { x: currentX, y: currentY } = target.dataset;

        const mapKeyToMoveDirection = {
            ArrowUp: (x, y) => [x, y - 1],
            ArrowDown: (x, y) => [x, y + 1],
            ArrowLeft: (x, y) => [x - 1, y],
            ArrowRight: (x, y) => [x + 1, y],
        };
        if (!Object.keys(mapKeyToMoveDirection).includes(key)) {
            return;
        }
        const move = (x, y, count = 0) => {
            if (count > Math.max(maxX, maxY)) {
                return;
            }
            const [nextX, nextY] = mapKeyToMoveDirection[key](Number(x), Number(y));
            if (nextX < 0 || nextX >= maxX || nextY < 0 || nextY >= maxY) {
                return;
            }
            const nextCell = target.parentElement.children[nextX + nextY * maxX];
            if (nextCell.disabled) {
                return move(nextX, nextY, count + 1);
            }
            nextCell.focus();
        };
        move(currentX, currentY);
    };

    renderGameStatusMessage() {
        const mapStateToFinishToMessage = {
            win: <span className="messageWin">All opened right! You win!🏆</span>,
            lose: <span className="messageLose">BOOM! Game Over! ☠️</span>,
            playing: null,
        };
        const { gameProcessState } = this.state;
        const flagsClass =
            this.game.leftFlags === 0 ? 'messageFlags messageFlagsZero' : 'messageFlags';

        return (
            <div className="message">
                <span className={flagsClass}>Flags: {this.game.leftFlags} </span>
                of {this.game.mines}. {mapStateToFinishToMessage[gameProcessState]}
            </div>
        );
    }

    render() {
        const { gameProcessState, closedField } = this.state;
        const boardHandles = {
            onClick: this.handleClick,
            onContextMenu: this.handleContextMenu,
            onMouseDown: this.handleMouseDown,
            onKeyDown: this.onKeyDown,
        };

        const fieldIsDisable = closedField.map((row) =>
            row.map(
                (cell) =>
                    gameProcessState !== 'playing' ||
                    cell === this.game.mapDefinitionToSymbol.ZERO_MINES_NEARBY
            )
        );

        return (
            <div className="App" onContextMenu={(e) => e.preventDefault()}>
                <FormInitGame handleStartNewGame={this._handleStartNewGame} />

                {gameProcessState === 'no-game' ? null : (
                    <>
                        {this.renderGameStatusMessage()}
                        <BoardGame
                            closedField={closedField}
                            fieldIsDisable={fieldIsDisable}
                            boardHandles={boardHandles}
                        />
                    </>
                )}
            </div>
        );
    }
}

export default App;
