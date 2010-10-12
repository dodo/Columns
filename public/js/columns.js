$(document).ready(function () {

// constants

WIDTH = 6;
HEIGHT = 18;

// helpers

var _ef = function(){};

if(typeof(console)==='undefined')console={log:_ef,error:_ef,warn:_ef, info:_ef};

var KEYS = {37:0, 39:0, 40:0};
var keydown = function (e) {KEYS[e.which] = 1;};
var keyup   = function (e) {KEYS[e.which] = 0;};
$(document).bind('keyup', 'left', keyup);
$(document).bind('keyup', 'down', keyup);
$(document).bind('keyup', 'right', keyup);
$(document).bind('keydown', 'left', keydown);
$(document).bind('keydown', 'down', keydown);
$(document).bind('keydown', 'right', keydown);

getUrlVars = function () {
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

Dummy = {update:_ef,next:_ef,check:_ef,shift:_ef,points:_ef,};

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


Block = function Block(gb, pos, a, b, c) {
    this.gb = gb;
    this.pos = Vector2D(pos);
    var names = ["a", "b", "c", "d", "e", "f"].slice(0,gb.difficulty);
    this.tiles = [new Tile(gb, a || pick(names)),
                  new Tile(gb, b || pick(names)),
                  new Tile(gb, c || pick(names))];
    this.update();
};

Block.prototype.update = function (dpos) {
    this.pos.add(dpos || Vector2D());
    for(var i=0;i<3;++i) this.tiles[i].pos(Vector2D(this.pos).sub({x:0,y:i}));
};


GameBoard = function GameBoard(cb, div, tilesize, theme, difficulty, islocal) {
    this.difficulty = difficulty || 6;
    this.tilesize = tilesize;
    this.cb = cb || Dummy;
    this._lastkeys = {};
    this.theme = theme;
    this._newlines = 0;
    this._combos = 0;
    this._points = 0;
    this.points = 0;
    this._free = {};
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

    this._shift = 0;
    this.state = 0;
    this.table = [];
    for(var i=0;i<WIDTH;++i) this.table.push(new Array(18));
    if((this._islocal = islocal)) {
        var that = this;
        this.current = new Block(this, {y:2, x:3});
        this.next = new Block(this, {y:2, x:WIDTH+1});
        this.status();
        this.interval = {
                falling: setInterval(function(){that.falling()}, 650),
                input:   setInterval(function(){that.input()}, 56),
            };
        $(document).bind('keydown', 'x', function () {that.shiftLeft()});
        $(document).bind('keydown', 'c', function () {that.shiftRight()});
    }
};

GameBoard.prototype.status = function () {
    this.cb.next(this.current.tiles[0].name,this.current.tiles[1].name,this.current.tiles[2].name);
    this.cb.next(this.next.tiles[0].name,this.next.tiles[1].name,this.next.tiles[2].name);
};

GameBoard.prototype.shiftLeft = function () {
    if (this.state === 0) {
        this._shift--;
        var cur = this.current;
        cur.tiles.unshift(cur.tiles.pop());
        cur.update();
    }
};

GameBoard.prototype.shiftRight = function () {
    if (this.state === 0) {
        this._shift++;
        var cur = this.current;
        cur.tiles.push(cur.tiles.shift());
        cur.update();
    }
};

GameBoard.prototype.falling = function () {
    if(this.state === 0) {
        var cur = this.current;
        if(cur.pos.y === HEIGHT-1 || this.table[cur.pos.x][cur.pos.y+1])
            this.doCheck();
        else {
            cur.update({x:0,y:1});
            this.cb.update(cur.pos.x, cur.pos.y);
        }
    }
};

GameBoard.prototype.doCheck = function () {
    var cur = this.current;
    if (cur) {
        for(var i=0;i<3;++i) {
            var p =Vector2D(cur.pos).sub({x:0,y:i});
            this.table[p.x][p.y] = cur.tiles[i];
        }
        this.state = 1;
        this.cb.check();
        this._combos = 0;
        this._points = 0;
        this.check();
    }
};

GameBoard.prototype.check = function (tiles) {
    if(this.state === 1) {
        var that = this;
        var cur = this.current;
        if(!tiles) {
            if(!cur) return;
            tiles = [];
            for(var i=0;i<3;++i) tiles.push(Vector2D(cur.pos).sub({x:0,y:i}));
        }
        var list = [];
        for(var i=0,il=tiles.length;i<il;++i) {
            var l = trace(this.table, tiles[i]);
            if (l.length > 2) {
                var b = false;
                for(var n=0,nl=list.length;n<nl;++n) {
                    var _b = false;
                    var s = 0;
                    for(var j=0,jl=l.length;j<jl;++j) {
                        for(var k=0, kl=list[n].length;k<kl;++k) {
                            if (list[n][k].equal(l[j])) s++;
                        }
                    }
                    b = s === l.length;
                    if (b) break;
                }
                if (!b) list.push(l);
            }
        }
        if (list.length) this._combos += list.length;
        for(var i=0,il=list.length;i<il;++i) {
            if (list[i].length > 3) this._points += list[i].length - 3;
            for(var n=0,nl=list[i].length;n<nl;++n) {
                var p = list[i][n];
                if(this.table[p.x][p.y]) {
                    this.table[p.x][p.y].img.effect('fade',{},333, function () {$(this).remove()});
                    this.table[p.x][p.y] = undefined;
                }
            }
        }
        setTimeout(function(){that.cleanup()}, 333);
    }
};

GameBoard.prototype.updateTable = function () {
    for(var x=0;x<WIDTH;++x) {
        for(var y=0;y<HEIGHT;++y) {
            if(this.table[x][y]) {
                this.table[x][y].pos({x:x,y:y});
            }
        }
    }
};

GameBoard.prototype.addLine = function (i) {
    this._newlines += i || 1;
};

GameBoard.prototype.removeLine = function (i) {
    this._newlines -= i || 1;
};

GameBoard.prototype.genNext = function (a, b, c) {
    this.current = this.next;
    if (this.current) this.current.update({y:0, x:-WIDTH+2});
    this.next = new Block(this, {y:2, x:WIDTH+1}, a, b, c);
    this.cb.next(this.next.tiles[0].name,this.next.tiles[1].name,this.next.tiles[2].name);
    if (this._combos) this._combos--;
    this.points += this._combos*10 + this._points;
    if (this._combos || this._points) this.cb.points(this._combos, this._points);
    this._combos = 0;
    this._points = 0;
    this.state = 0;
    if (this._newlines) {
        var tile, add = this._newlines > 0;
        for(var x=0;x<WIDTH;++x) {
            for(var i=0,il=Math.abs(this._newlines);i<il;++i) {
                if(add) {
                    tile = new Tile(this, "block");
                    var t = this.table[x].shift();
                    if (t) t.img.remove();
                    this.table[x].push(tile);
                    tile.pos({x:x, y:HEIGHT-1});
                } else {
                    if (this.table[x][HEIGHT-1]) {
                        if(this.table[x][HEIGHT-1].name === "block") {
                            this.table[x].pop().img.remove();
                            this.table[x].unshift(undefined);
                        }
                    }
                }
            }
        }
        this.updateTable();
        this._newlines = 0;
    }
};

GameBoard.prototype.cleanup = function () {
    var list = [];
    for(var x=0;x<WIDTH;++x) {
        var offset = 0;
        for(var y=HEIGHT-1;y>=0;--y) {
            if(this.table[x][y]) {
                if(offset) {
                    list.push(Vector2D({x:x,y:y+offset}));
                    this.table[x][y].pos({x:x,y:y+offset});
                    this.table[x][y+offset] = this.table[x][y];
                    this.table[x][y] = undefined;
                }
            } else offset++;
        }
    }
    if(this._islocal && list.length === 0) this.genNext();
    else {
        var that = this;
        setTimeout(function(){that.check(list)},333);
    }
};

GameBoard.prototype.input = function () {
    if(this.state === 0) {
        var cur = this.current;
        var diff = Vector2D();
        if(KEYS[37] && this._free[37]) diff.add({y:0, x: (cur.pos.x ===        0 || this.table[cur.pos.x-1][cur.pos.y]) ? 0 : -1});
        if(KEYS[39] && this._free[39]) diff.add({y:0, x: (cur.pos.x ===  WIDTH-1 || this.table[cur.pos.x+1][cur.pos.y]) ? 0 :  1});
        if(KEYS[40] && this._free[40]) diff.add({x:0, y: (cur.pos.y === HEIGHT-1 || this.table[cur.pos.x][cur.pos.y+1]) ? 0 :  1});
        if(diff.x !== 0 || diff.y !== 0) {
            cur.update(diff);
            this.cb.update(cur.pos.x, cur.pos.y);
        }
        if(this._shift) {
            this.cb.shift(this._shift);
            this._shift = 0;
        }
        for(var i=0;i<3;++i) {
            var n = [37, 39, 40][i];
            this._free[n] = !(this._lastkeys[n] < KEYS[n]);
            this._lastkeys[n] = KEYS[n];
        }
    }
};

});