$(document).ready(function () {

// constants

TILE_SIZE = 23;

// helpers

var KEYS = {37:0, 39:0, 40:0};
var keydown = function (e) {KEYS[e.which] = 1;};
var keyup   = function (e) {KEYS[e.which] = 0;};
$(document).bind('keyup', 'left', keyup);
$(document).bind('keyup', 'down', keyup);
$(document).bind('keyup', 'right', keyup);
$(document).bind('keydown', 'left', keydown);
$(document).bind('keydown', 'down', keydown);
$(document).bind('keydown', 'right', keydown);

var pick = function(list) {
    return list[Math.round((list.length-1)*Math.random())];
};

// classes

Tile = function (gb, name) {
    this._board = gb.gui.board;
    this.name = name;
    this.img = $("<img>").attr({
            src:"/img/"+gb.theme+"/"+name+".png",
            width:TILE_SIZE,
            height:TILE_SIZE
        }).css("position","absolute");
    this._board.append(this.img);
};

Tile.prototype.pos = function (pos) {
    this.img.css({top:pos.y*TILE_SIZE+this._board.offset().top+1,
                 left:pos.x*TILE_SIZE+this._board.offset().left+1});
};


Block = function (gb, pos) {
    this.gb = gb;
    this.pos = Vector2D(pos);
    var names = ["a", "b", "c", "d", "e"];
    this.tiles = [new Tile(gb, pick(names)),
                  new Tile(gb, pick(names)),
                  new Tile(gb, pick(names))];
    this.update();
};

Block.prototype.update = function (dpos) {
    this.pos.add(dpos || Vector2D());
    for(var i=0;i<3;++i) this.tiles[i].pos(Vector2D(this.pos).sub({x:0,y:i}));
};


GameBoard = function (div, theme) {
    this.theme = theme;
    this.gui = {
        div: $(div).css({
                width: TILE_SIZE*7 + 10,
                height:TILE_SIZE*18,
            }),
        board: $("<div>").css({
                border: "1px solid #666",
                width: TILE_SIZE*6,
                height: TILE_SIZE*18,
                float: "left",
            }),
        next: $("<div>").css({
                border: "1px solid #ccc",
                width: TILE_SIZE,
                height: TILE_SIZE*3,
                marginLeft: TILE_SIZE*7,
            }),
        a: $("<img>").attr("src", "/img/"+theme+"/a.png").css("display","none"),
        b: $("<img>").attr("src", "/img/"+theme+"/b.png").css("display","none"),
        c: $("<img>").attr("src", "/img/"+theme+"/c.png").css("display","none"),
        d: $("<img>").attr("src", "/img/"+theme+"/d.png").css("display","none"),
        e: $("<img>").attr("src", "/img/"+theme+"/e.png").css("display","none"),
    };
    this.gui.div.append(this.gui.board)
                .append(this.gui.next)
                .append(this.gui.a)
                .append(this.gui.b)
                .append(this.gui.c)
                .append(this.gui.d)
                .append(this.gui.e);

    var that = this;
    this.state = 0;
    this.table = [];
    for(var i=0;i<6;++i) this.table.push(new Array(18));
    this.current = new Block(this, {y:2, x:2});
    this.next = new Block(this, {y:2, x:7});
    this.interval = {
            falling: setInterval(function(){that.falling()}, 650),
            input:   setInterval(function(){that.input()}, 42),
        };
};

GameBoard.prototype.falling = function () {
    if(this.state === 0) {
        var cur = this.current;
        if(cur.pos.y === 17 || this.table[cur.pos.x][cur.pos.y+1]) {
            for(var i=0;i<3;++i) {
                var p =Vector2D(cur.pos).sub({x:0,y:i});
                this.table[p.x][p.y] = cur.tiles[i].name;
                this.state = 1;
            }
        } else cur.update({x:0,y:1});
    }
};

GameBoard.prototype.input = function () {
    if(this.state === 0) {
        var cur = this.current;
        var diff = Vector2D();
        if(KEYS[37]) diff.add({y:0, x: (cur.pos.x ===  0 || this.table[cur.pos.x-1][cur.pos.y]) ? 0 : -1});
        if(KEYS[39]) diff.add({y:0, x: (cur.pos.x ===  5 || this.table[cur.pos.x+1][cur.pos.y]) ? 0 :  1});
        if(KEYS[40]) diff.add({x:0, y: (cur.pos.y === 17 || this.table[cur.pos.x][cur.pos.y+1]) ? 0 :  1});
        if(diff.x !== 0 || diff.y !== 0) cur.update(diff);
    }
};

//testing

var test = function () {
    console.log("testing …");
    var gb = new GameBoard(".gameboard", "plain");
};

test();

});