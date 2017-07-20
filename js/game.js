"use strict";

var board = new Board(7, 7);
var cntTile = [];
var pf = new Pathfinder(board);
//pf.updateValues();

var cbID = 0;

function translatePos(event) {
    let rect = event.target.getBoundingClientRect();
    return Board.getPos(event.clientX-rect.left, event.clientY-rect.top);
}
function updateTile(pos) {
    cntTile = pos;
}

function dragging(event) {
    console.log(event);
}

function drawTile() {
    var canvas = $('#canvy').get(0);
    var ctx = canvas.getContext('2d');
    switch (board.getType(cntTile)) {
        case 1:
            ctx.fillStyle='#2c86d3';
            ctx.fillRect(cntTile[0]*114, cntTile[1]*91, 114, 91);
            break;
        default:
            console.log('hi');
            break;
    }

}

$(document).ready(() => {
    var $canvas = $('#canvy');
    $canvas.click( (event) => {
        updateTile(translatePos(event));
        board.setType(cntTile);
        drawTile(cntTile);
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
