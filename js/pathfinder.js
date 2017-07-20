"use strict";

/**
 * Created by angel on 6/13/17.
 */

class Pathfinder {
    constructor(board, start, end) {
        this.board = board;
        this.opened = [1,2,3,5,7,8];
        this.closed = [];
        this.current = 0;
        this.start = board.getPos;
        this.end = 0;
    }
    static getDistance(x, y) {
        return Math.abs(x - y);
    }
    updateValues() {
        this.opened.forEach( (tile) => {
            tile.d = tile.parent.d + 10;
            tile.h = Math.abs(tile.x - this.end.x) + Math.abs(tile.y - this.end.y);
            tile.t = tile.d + tile.h;
        });
    }

}