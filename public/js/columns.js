$(document).ready(function () {

// constants

WIDTH = 6;
HEIGHT = 18;

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

var getUrlVars = function () {
    var map = {};
    var parts = window.location.search.replace(/[?&]+([^=&]+)(=[^&]*)?/gi,
        function (m, key, value) {
            map[key] = (value === undefined) ? true : value.substring(1);
        });
    return map;
};

var pick = function(list) {
    return list[Math.round((list.length-1)*Math.random())];
};

var trace = function (table, pos) {
    var p, l, d = [];
    var list = [pos];
    var name = table[pos.x][pos.y].name;
    var dir = [{x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},{x:-1,y:0},{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1}];
    for(var i=0;i<8;++i) {
        l = [];
        for(var n=1, m=(dir[i].x===0&&HEIGHT||WIDTH);n<m;++n) {
            p = Vector2D(dir[i]).mul(n).add(pos);
            if (p.x < 0 || p.x > WIDTH-1 ||
                p.y < 0 || p.y > HEIGHT-1 ||
                table[p.x][p.y] === undefined ||
                table[p.x][p.y].name !== name) break;
            else l.push(p);
        }
        if(i>3) {
            l = l.concat(d[i-4]);
        if (l.length > 1) list = list.concat(l);
        } else d.push(l);
    }
    return list;
};

// classes

Tile = function Tile(gb, name) {
    this._board = gb.gui.board;
    this.size = gb.tilesize;
    this.name = name;
    this.img = $("<img>").attr({
            src:"/img/"+gb.theme+"/"+name+".png",
            width:gb.tilesize,
            height:gb.tilesize
        }).css("position","absolute");
    this._board.append(this.img);
};

Tile.prototype.pos = function (pos) {
    this.img.css({top:pos.y*this.size+this._board.offset().top+1,
                 left:pos.x*this.size+this._board.offset().left+1});
};


Block = function Block(gb, pos) {
    this.gb = gb;
    this.pos = Vector2D(pos);
    var names = ["a", "b", "c", "d", "e", "f"].slice(0,gb.difficulty);
    this.tiles = [new Tile(gb, pick(names)),
                  new Tile(gb, pick(names)),
                  new Tile(gb, pick(names))];
    this.update();
};

Block.prototype.update = function (dpos) {
    this.pos.add(dpos || Vector2D());
    for(var i=0;i<3;++i) this.tiles[i].pos(Vector2D(this.pos).sub({x:0,y:i}));
};


GameBoard = function GameBoard(div, tilesize, theme, difficulty, islocal) {
    this.difficulty = difficulty || 6;
    this.tilesize = tilesize;
    this.theme = theme;
    this.gui = {
        div: $(div).css({
                width: tilesize*(WIDTH+2)+4,
                height:tilesize*HEIGHT,
            }),
        board: $("<div>").css({
                border: "1px solid #666",
                width: tilesize*WIDTH,
                height: tilesize*HEIGHT,
                float: "left",
            }),
        next: $("<div>").css({
                border: "1px solid #ccc",
                width: tilesize,
                height: tilesize*3,
                marginLeft: tilesize*(WIDTH+1),
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

    if(islocal) {
        var that = this;
        this.state = 0;
        this.table = [];
        for(var i=0;i<WIDTH;++i) this.table.push(new Array(18));
        this.current = new Block(this, {y:2, x:3});
        this.next = new Block(this, {y:2, x:WIDTH+1});
        this.interval = {
                falling: setInterval(function(){that.falling()}, 650),
                input:   setInterval(function(){that.input()}, 56),
            };
        $(document).bind('keydown', 'x', function () {
            if (that.state === 0) {
                var cur = that.current;
                cur.tiles.unshift(cur.tiles.pop());
                cur.update();
            }
        });
        $(document).bind('keydown', 'c', function () {
            if (that.state === 0) {
                var cur = that.current;
                cur.tiles.push(cur.tiles.shift());
                cur.update();
            }
        });
    }
};

GameBoard.prototype.falling = function () {
    if(this.state === 0) {
        var cur = this.current;
        if(cur.pos.y === HEIGHT-1 || this.table[cur.pos.x][cur.pos.y+1]) {
            for(var i=0;i<3;++i) {
                var p =Vector2D(cur.pos).sub({x:0,y:i});
                this.table[p.x][p.y] = cur.tiles[i];
            }
            this.state = 1;
            this.check();
        } else cur.update({x:0,y:1});
    }
};

GameBoard.prototype.check = function (tiles) {
    if(this.state === 1) {
        var that = this;
        var cur = this.current;
        if(!tiles) {
            tiles = [];
            for(var i=0;i<3;++i) tiles.push(Vector2D(cur.pos).sub({x:0,y:i}));
        }
        var list = [];
        for(var i=0,il=tiles.length;i<il;++i) {
            var l = trace(this.table, tiles[i]);
            if(l.length>2)  list.push(l);
        }
        for(var i=0,il=list.length;i<il;++i) {
            for(var n=0,nl=list[i].length;n<nl;++n) {
                var p = list[i][n];
                if(this.table[p.x][p.y]) {
                    this.table[p.x][p.y].img.effect('fade',{},333, function () {$(this).remove()});
                    this.table[p.x][p.y] = undefined;
                }
            }
        }
        setTimeout(function(){that.cleanup()},333)
    }
};

GameBoard.prototype.cleanup = function () {
    var list = [];
    for(var x=0;x<WIDTH;++x) {
        var offset = 0;
        for(var y=HEIGHT-1;y>=0;--y) {
            if(this.table[x][y]) {
                if(offset) {
                    list.push({x:x,y:y+offset});
                    this.table[x][y].pos({x:x,y:y+offset});
                    this.table[x][y+offset] = this.table[x][y];
                    this.table[x][y] = undefined;
                }
            } else offset++;
        }
    }
    if(list.length === 0) {
        this.current = this.next;
        this.current.update({y:0, x:-WIDTH+2});
        this.next = new Block(this, {y:2, x:WIDTH+1});
        this.state = 0;
    } else {
        var that = this;
        setTimeout(function(){that.check(list)},333)
    }
};

GameBoard.prototype.input = function () {
    if(this.state === 0) {
        var cur = this.current;
        var diff = Vector2D();
        if(KEYS[37]) diff.add({y:0, x: (cur.pos.x ===        0 || this.table[cur.pos.x-1][cur.pos.y]) ? 0 : -1});
        if(KEYS[39]) diff.add({y:0, x: (cur.pos.x ===  WIDTH-1 || this.table[cur.pos.x+1][cur.pos.y]) ? 0 :  1});
        if(KEYS[40]) diff.add({x:0, y: (cur.pos.y === HEIGHT-1 || this.table[cur.pos.x][cur.pos.y+1]) ? 0 :  1});
        if(diff.x !== 0 || diff.y !== 0) cur.update(diff);
    }
};

//testing

var test = function () {
    console.log("testing …");
    var vars = getUrlVars();
    var d = vars.difficulty || 6;
    if (d < 3) d = 3; else if (d > 6) d = 6;
    var gb = new GameBoard(".gameboard", 23, vars.theme || "plain", d, true);
};

test();

});