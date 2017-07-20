"use strict";


class tile {
    constructor() {
        this.type = 0;
        this.parent = 0;
        this.x = 0;
        this.y = 0;
        this.d = 0;
        this.h = 0;
        this.t = 0;
    }
}

class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];

        for(let i=0;i<width;i++) {
            this.tiles[i] = [];
            for(let j=0;j<height;j++) {
                this.tiles[i][j] = new tile();
                this.tiles[i][j].x = i;
                this.tiles[i][j].y = j;
            }
        }

    }
    static getPos(x, y) {
        return[Math.floor(x/114),Math.floor(y/91)];
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
