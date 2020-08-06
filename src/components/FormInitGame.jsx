import React from 'react';
import './FormInitGame.css';

class FormInitGame extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            columnsCount: 9,
            rowsCount: 9,
            minesCount: 10,
        };
    }

    handleChange = ({ target: { name, value } }) => {
        this.setState({ [name]: value });
    };

    handleSubmitStartNewGame = (event) => {
        event.preventDefault();
        const { columnsCount, rowsCount, minesCount } = this.state;

        const { handleStartNewGame } = this.props;
        handleStartNewGame(Number(columnsCount), Number(rowsCount), Number(minesCount));
    };

    componentDidMount() {
        // create default game field when page loaded
        const { columnsCount, rowsCount, minesCount } = this.state;

        const { handleStartNewGame } = this.props;
        handleStartNewGame(Number(columnsCount), Number(rowsCount), Number(minesCount));
    }

    render() {
        const { columnsCount, rowsCount, minesCount } = this.state;
        const maxMinesCount = columnsCount * rowsCount - 1;

        return (
            <form
                name="initGameSettings"
                className="formInitGameSettings"
                action=""
                onSubmit={this.handleSubmitStartNewGame}
            >
                <label htmlFor="x">
                    X:
                    <input
                        type="number"
                        name="columnsCount"
                        className="fieldColumnsCount"
                        min="2"
                        max="70"
                        value={columnsCount}
                        onChange={this.handleChange}
                        required
                    />
                </label>
                <label htmlFor="y">
                    Y:
                    <input
                        type="number"
                        name="rowsCount"
                        className="fieldRowsCount"
                        min="2"
                        max="64"
                        value={rowsCount}
                        onChange={this.handleChange}
                        required
                    />
                </label>
                <label htmlFor="mines">
                    Mines:
                    <input
                        type="number"
                        name="minesCount"
                        className="fieldMinesCount"
                        min="1"
                        max={maxMinesCount}
                        value={minesCount}
                        onChange={this.handleChange}
                        required
                    />
                </label>
                <button type="submit" className="buttonStartGame">
                    Start game!
                </button>
            </form>
        );
    }
}

export default FormInitGame;
