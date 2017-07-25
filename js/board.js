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
    pos() { return [this.x, this.y] };
}

class Board {
    constructor(width, height, draw) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.updated = [];
        this.draw = draw;

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
        return[Math.floor(x/32),Math.floor(y/32)];
    }

    reset(walls) {
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          if(this.tiles[i][j].type == 1 && !walls) {
            continue
          } else {
            this.tiles[i][j].type = 0;
          }
          this.tiles[i][j].d = 0;
          this.tiles[i][j].h = 0;
          this.tiles[i][j].t = 0;
          this.tiles[i][j].parent = 0;
          this.updated.push(this.tiles[i][j]);
        }
      }
    }

    update() {
      for(let i = 0; i < this.updated.length; i++) {
        this.draw(this.updated[i]);
      }
      this.updated = [];
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
    getTile(pos) {
        if(pos[0] < 0 || pos[1] < 0 || pos[0] >= this.width || pos[1] >= this.height)
            return;
        return this.tiles[pos[0]][pos[1]];
    }
}
