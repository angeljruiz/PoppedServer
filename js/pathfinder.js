"use strict";

/**
 * Created by angel on 6/13/17.
 */


class Pathfinder {
    constructor(board, start, end) {
        this.board = board;
        this.start = this.board.getTile(start);
        this.end = this.board.getTile(end);
        this.reset(false);
    }

    static checkList(list, tile) {
      for(let i = 0; i < list.length; i++) {
        if(list[i].x == tile.x && list[i].y == tile.y)
          return true;
      }
      return false;
    }

    static removeFromList(list, tile) {
      if (tile.x < 0 || tile.y < 0)
        return;
      for(let i = 0; i < list.length; i++) {
        if(list[i].x == tile.x && list[i].y == tile.y)
          return list.splice(i, 1);
      }
    }

    findPath() {
      let i = 0;
      while (!this.addToOpen() && i <= 300) {
        i++;
      }
    }

    reset(all = true, walls = false) {
      this.opened = [];
      this.closed = [];
      this.path = [];
      this.current = this.start;
      this.opened.push(this.current);
      this.board.updated.push(this.current);
      this.board.updated.push(this.end);
      if (all)
        this.board.reset(walls);
      this.start.type = 5;
      this.end.type = 3;
      this.board.update();
    }

    finished(tile) {
      if (!tile)
        return;
      if(tile.x == this.end.x && tile.y == this.end.y)
      {
        tile.parent = this.current;
        var node = tile.parent;
        while(node != this.start) {
          node.type = 4;
          this.path.push(node);
          this.board.updated.push(node);
          node = this.board.getTile(node.parent.pos());
        }
        this.start.type = 5;
        this.board.updated.push(this.start);
        this.path.reverse();
        return true;
      }
      return false;
    }

    updateValues() {
      let best = this.opened[0];
      console.log('best ' + best.pos());
      for(let i = 0; i < this.opened.length; i++) {
        if(this.opened[i].parent) {
          this.opened[i].d = this.opened[i].parent.d + 10;
        } else if (this.opened[i] != this.start) {
          this.opened[i].d = 10;
        }
        this.opened[i].h = (Math.abs(this.opened[i].x - this.end.x) + Math.abs(this.opened[i].y - this.end.y)) * 10;
        this.opened[i].t = this.opened[i].d + this.opened[i].h;
        if(this.opened[i].t < best.t) {
          best = this.opened[i];
          console.log('updated best ' + best.pos());
        }
      }
      this.closed.push(best);
      Pathfinder.removeFromList(this.opened, best);
      best.type = 3;
      this.board.updated.push(best);
      this.current = best;
    }

    addToOpen() {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if(i != 0 || j != 0) {
            let tile = this.board.getTile([this.current.x+i, this.current.y+j]);
            if (this.finished(tile)) {
              this.board.update();
              return true;
            }
            if(tile && tile.type != 1 && !Pathfinder.checkList(this.closed, tile)) {
              if (!Pathfinder.checkList(this.opened, tile)) {
                tile.parent = this.current;
                this.opened.push(tile);
                this.board.updated.push(tile);
                tile.type = 2;
              } else if (tile.g < this.current.g)
                  tile.parent = this.current;
            }
          }
        }
      }
      this.updateValues();
      this.board.update();
      return false;
    }

}
