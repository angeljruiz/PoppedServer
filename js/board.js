"use strict";


class tile {
    constructor() {
        this.type = 0;
    }
}

class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];

        this.getPos = (x, y) => {
            return[Math.floor(x/32),Math.floor(y/32)];
        }
        for(let i=0;i<width;i++) {
            this.tiles[i] = [];
            for(let j=0;j<height;j++)
                this.tiles[i][j] = new tile();
        }

    }
    setType(pos) {
        if(pos[0] < 0 || pos[1] < 0 || pos[0] >= this.width || pos[1] >= this.height)
            return false;
        this.tiles[pos[0]][pos[1]].type = 1;
    }
    getType(pos) {
        if(pos[0] < 0 || pos[1] < 0 || pos[0] >= this.width || pos[1] >= this.height)
            return false;
        return this.tiles[pos[0]][pos[1]].type;
    }
}
