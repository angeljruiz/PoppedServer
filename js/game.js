"use strict";

var pf = 0;

var cbID = 0;

function translatePos(event) {
    let rect = event.target.getBoundingClientRect();
    return Board.getPos(event.clientX-rect.left, event.clientY-rect.top);
}

function dragging(event) {
    console.log(event);
}

$(document).ready(() => {
    var $canvas = $('#canvy');
    var board = new Board(25, 20, (pos) => {
        var canvas = document.getElementById('canvy');
        var ctx = canvas.getContext('2d');
        switch (pos.type) {
            case 1:
                ctx.fillStyle='blue';
                break;
            case 2:
                ctx.fillStyle='white';
                break;
            case 3:
                ctx.fillStyle='red';
                break;
            case 4:
                ctx.fillStyle='green';
                break;
            case 5:
                ctx.fillStyle='yellow';
                break;
            default:
                ctx.fillStyle='gray';
                break;
        }
        ctx.fillRect(pos.x*32, pos.y*32, 32, 32);
        ctx.fillStyle='gray';
        if(pos.parent) {
          ctx.fillStyle='black';
          ctx.beginPath();
          ctx.moveTo(pos.x*32+16, pos.y*32+16);
          ctx.lineTo(pos.parent.x*32+16, pos.parent.y*32+16);
          ctx.stroke();
        }
    });
    pf = new Pathfinder(board, [0,0], [24,19]);
    $canvas.click( (event) => {
        board.setType(translatePos(event));
        board.draw(board.getTile(translatePos(event)));
    });

    $canvas.mousedown( ()=> {
        cbID = setInterval(dragging, 120, event);
    });

    $canvas.mouseup( ()=> {
        clearInterval(cbID);
    });

    $canvas.mouseleave( () => {
        clearInterval(cbID);
    });
});
