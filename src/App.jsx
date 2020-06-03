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
        this.state = { gameProcessState: 'no-game', closedField: [] };
        this.boardEl = React.createRef();
    }

    updateState = () => {
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

        this.updateState();
    };

    _openCell = (x, y) => {
        const start = Date.now();
        console.log('start', 0);
        this.game.stepToOpenCell(Number(x), Number(y));
        console.log('end STEP', Date.now() - start);
        console.log(this.game.gameState);

        this.updateState();
    };

    _markFlag = (x, y) => {
        this.game.markMine(Number(x), Number(y));
        this.updateState();
    };

    _openSafeArea8 = (x, y) => {
        this.game.ifSafeSpaceOpenArea8(Number(x), Number(y));
        this.updateState();
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
        if (
            target.classList.contains('closed') &&
            !target.classList.contains('flagged')
        ) {
            const { x, y } = target.dataset;
            this._openCell(x, y);
        }
    };

    handleContextMenu = (event) => {
        event.preventDefault();
        const { target } = event;
        if (!target.classList.contains('Cell')) {
            return false;
        }

        if (target.classList.contains('closed')) {
            const { x, y } = target.dataset;
            this._markFlag(x, y);
        }
    };

    handleMouseDown = ({ target, button }) => {
        if (!target.classList.contains('Cell') || button !== 0) {
            return false;
        }
        if (!target.classList.contains('closed') && !target.classList.contains('empty')) {
            const { x, y } = target.dataset;
            this._openSafeArea8(x, y);
        }
    };

    render() {
        const { gameProcessState, closedField } = this.state;
        const boardHandles = {
            onClick: this.handleClick,
            onContextMenu: this.handleContextMenu,
            onMouseDown: this.handleMouseDown,
        };
        const mapGameStateToView = {
            win: (
                <span>
                    . <span className="messageWin">All opened right! You win!🏆</span>
                </span>
            ),
            lose: (
                <span>
                    . <span className="messageLose">BOOM! Game Over! ☠️</span>
                </span>
            ),
            playing: null,
        };
        return (
            <div
                className="App"
                onContextMenu={(e) => e.preventDefault()}
                onDoubleClick={(e) => e.preventDefault()}
            >
                <FormInitGame handleStartNewGame={this._handleStartNewGame} />
                {gameProcessState === 'no-game' ? null : (
                    <div className="message">
                        <span
                            className={`messageFlags ${
                                this.game.leftFlags === 0 ? 'messageFlagsZero' : null
                            }`}
                        >
                            Flags: {this.game.leftFlags} </span>
                        of {this.game.mines}
                        {mapGameStateToView[gameProcessState]}
                    </div>
                )}
                {gameProcessState === 'no-game' ? null : (
                    <BoardGame
                        closedField={closedField}
                        gameProcessState={gameProcessState}
                        boardHandles={boardHandles}
                    />
                )}
            </div>
        );
    }
}

export default App;
