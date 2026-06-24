export class MoveStore {
    /**
     * All games that have been seen, the index of the game is it's 'id'
     */
    games = [];
    /**
     * A map of game hash -> id, for faster look up of game ids.
     */
    gameIdMap = new Map();
    /**
     * Left moves for a game, where the index is the game id.
     */
    leftMoveSets = [];
    /**
     * Right moves for a game, where the index is the game id.
     */
    rightMoveSets = [];
    leftMoves(state) {
        return this.getLeftMoveIds(this.getGameId(state)).map((id) => this.idToGame(id));
    }
    rightMoves(state) {
        return this.getRightMoveIds(this.getGameId(state)).map((id) => this.idToGame(id));
    }
    getLeftMoveIds(gameId) {
        let leftMoves = this.leftMoveSets[gameId];
        if (leftMoves === undefined) {
            leftMoves = [];
            for (const move of this.idToGame(gameId).movesLeft()) {
                leftMoves.push(this.getGameId(move));
            }
            this.leftMoveSets[gameId] = leftMoves;
        }
        return leftMoves;
    }
    getRightMoveIds(gameId) {
        let rightMoves = this.rightMoveSets[gameId];
        if (rightMoves === undefined) {
            rightMoves = [];
            for (const move of this.idToGame(gameId).movesRight()) {
                rightMoves.push(this.getGameId(move));
            }
            this.rightMoveSets[gameId] = rightMoves;
        }
        return rightMoves;
    }
    *iterGames() {
        for (const game of this.games) {
            yield game;
        }
    }
    idToGame(id) {
        if (id < 0 || id >= this.games.length) {
            throw new Error(`Unknown game id ${id}`);
        }
        return this.games[id];
    }
    getGameId(state) {
        const id = this.gameIdMap.get(state.hash());
        if (id === undefined) {
            const newId = this.games.length;
            this.games.push(state);
            this.gameIdMap.set(state.hash(), newId);
            return newId;
        }
        return id;
    }
}
