import React from 'react';
import './App.css';
import FormInitGame from './components/FormInitGame.jsx';
import BoardGame from './components/BoardGame.jsx';
import MinesweeperLogic from './MinesweeperLogic';

// const dictGameProcessStates = ['no-game', 'playing', 'win', 'lose'];
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { gameProcessState: 'no-game', closedField: [] };
        this.boardEl = React.createRef();
    }

    handleStartNewGame = (columnsCount, rowsCount, minesCount) => {
        this.game = new MinesweeperLogic(columnsCount, rowsCount, minesCount);
        this.game.init();

        document.documentElement.style.setProperty('--x', columnsCount);
        document.documentElement.style.setProperty('--y', rowsCount);

        this.setState({
            gameProcessState: 'playing',
            closedField: this.game.closedField,
        });
    };

    _openCell = (x, y) => {
        const start = Date.now();
        console.log('start', 0);
        this.game.stepToOpenCell(Number(x), Number(y));
        console.log('end STEP', Date.now() - start);
        console.log(this.game.gameState);

        this.setState({
            gameProcessState: this.game.gameState,
            closedField: this.game.closedField,
        });
    };

    _markFlag = (x, y) => {
        this.game.markMine(Number(x), Number(y));

        this.setState({
            gameProcessState: this.game.gameState,
            closedField: this.game.closedField,
        });
    };

    _openSafeArea8 = (x, y) => {
        this.game.ifSafeSpaceOpenArea8(Number(x), Number(y));

        this.setState({
            gameProcessState: this.game.gameState,
            closedField: this.game.closedField,
        });
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
        return (
            <div
                className="App"
                onContextMenu={(e) => e.preventDefault()}
                onDoubleClick={(e) => e.preventDefault()}
            >
                <FormInitGame handleStartNewGame={this.handleStartNewGame} />

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
