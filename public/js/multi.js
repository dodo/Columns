$(document).ready(function () {

// helpers

var genId = function () {
    return (((1+Math.random())*0x10000)|0).toString(16);
};

// settings

if (!WebSocket) {
    $("#name").text("honk … this games uses websocket … so get a real browser!");
    return;
}

var localgb;
var players = {};
var id = genId();
var vars = getUrlVars();
var name = vars.name || "Player";
var ws = new WebSocket('ws://' + document.location.host + '/');
var theme = vars.theme || "plain";
var difficulty = vars.difficulty || 6;
if (difficulty < 3) difficulty = 3; else if (difficulty > 6) difficulty = 6;

// workers

var addPlayer = function (i, n, t, d) {
    if (players.hasOwnProperty(i)) {
        players[i].name.text(n);
    } else {
        var gb, handler = {
            update:Dummy.udate,
            next:Dummy.next,
            check:Dummy.check,
            shift:Dummy.shift,
            points: function (c, p) {
                gb.removeLine(c+p);
                localgb.addLine(c+p);
                localgb.forceNext();
            },
        };
        var div = $("<div>").attr({class:"gb"+i}).css({display:"inline"});
        var name = $("<p>").text(n).appendTo(div);
        div.appendTo(".previews");
        console.log("add player: "+t+"  "+d);
        gb = new GameBoard(handler,".gb"+i, 9, t, d);
        players[i] = {div:div, name:name, gb:gb};
    }
};

var listener = function (ev) {
    var msg = ev.data;
    console.log("02:"+msg);
    var prefix = msg.slice(0,2);
    if (prefix === "me") {
        var a = msg.split(':');
        addPlayer(a[1],a[1],a[3],parseInt(a[2]));
    } else if (prefix === "hs") {
        var a = msg.split(':');
        var i = a[1];
        var n = a.slice(2).join("");
        if(name === n) ws.send("no:" + id + ":" + i);
        else {
            ws.send("ok:"+id+":"+i+":"+difficulty+":"+theme+":"+name);
            if (localgb) localgb.status(); else console.warn("new player without an update")
            addPlayer(i, n);
        }
    } else if (prefix === "nx") {
        var a = msg.split(':');
        var i = a[1];
        if (players.hasOwnProperty(i)) {
            players[i].gb.genNext(a[2], a[3], a[4]);
        } else console.error("unknown player "+i);
    } else if (prefix === "up") {
        var a = msg.split(':');
        var i = a[1];
        if (players.hasOwnProperty(i)) {
            if (players[i].gb.current)
                players[i].gb.current.update(
                    Vector2D({x:parseFloat(a[2]),y:parseFloat(a[3])}).sub(players[i].gb.current.pos)
                );
        } else console.error("unknown player "+i);
    } else if (prefix === "ch") {
        var a = msg.split(':');
        var i = a[1];
        if (players.hasOwnProperty(i)) players[i].gb.doCheck();
        else console.error("unknown player "+i);
    } else if (prefix === "sh") {
        var a = msg.split(':');
        var i = a[1];
        if (players.hasOwnProperty(i)) {
            var gb = players[i].gb;
            var s = parseInt(a[2]);
            for(var n=0, nl=Math.abs(s);n<nl;n++) {
                if (s < 0) gb.shiftLeft();
                else gb.shiftRight();
            }
        }
        else console.error("unknown player "+i);
    } else if (prefix === "cl") {
        var i = msg.split(":")[1];
        if (players.hasOwnProperty(i)) {
            players[i].div.remove();
            delete players[i];
        } else console.error("unknown player "+i);
    }
};


var run = function () {
    var handler = {
        check: function () {
            ws.send("ch:"+id);
        },
        shift: function (s) {
            ws.send("sh:"+id+":"+s);
        },
        update: function (x, y) {
             ws.send("up:"+id+":"+x+":"+y);
        },
        next: function (a, b, c) {
            ws.send("nx:"+id+":"+a+":"+b+":"+c);
        },
        points: function (c,p) {
            $("#name").text(name+" - "+localgb.points+" points");
            localgb.removeLine(c+p);
            Object.keys(players).forEach(function (key) {
                players[key].gb.addLine(c+p);
            });
        },
    };
    $("#loading").remove();
    console.log("running …");
    localgb = new GameBoard(handler, ".gameboard", 23, theme, difficulty, true);
    setTimeout(function () {
        Object.keys(players).forEach(function (i) {
            console.log("update",i)
            var gb = players[i];
            if (gb.current) gb.current.update();
            if (gb.next) gb.next.update();
            gb.updateTable();
        });
    }, 23);
};


var start = function () {
    $("#name").text(name);
    var counter = 0;
    var newname = name;
    ws.send("me:"+id+":"+difficulty+":"+theme);
    ws.send("hs:"+id+":"+name);
    var oldonclose = ws.onclose;
    var connect = function () {
        name = newname;
        ws.onmessage = listener;
        ws.onclose = oldonclose;
        $("#name").text(name);
        run();
    };
    var timeout = setTimeout(connect, 666);
    ws.onclose = function () {
        console.log('close');
        clearTimeout(timeout);
    };
    ws.onmessage = function(ev) {
        var msg = ev.data;
        console.log("01:"+msg);
        var prefix = msg.slice(0,2);
        if (prefix === "no" || prefix === "ok") {
            clearTimeout(timeout);
            timeout = setTimeout(connect, 666);
            if (prefix === "no") {
                counter++;
                newname = name + " " + counter;
                ws.send("hs:"+id+":"+newname);
            } else if (prefix === "ok") {
                var a = msg.split(':');
                if (a[2] === id) addPlayer(a[1], a.slice(5).join(""), a[4], a[3]);
            }
        } else listener(ev);
    };
};


// handles


ws.onopen = function() {
    console.log('open');
    start();
};
ws.onclose = function() {
    console.log('close');
    if (localgb) {
        clearInterval(localgb.interval.falling);
        clearInterval(localgb.interval.input);
        $("#name").text($("#name").text()+" - connection died.");
    }
};
ws.onerror = function(e) {
    console.error(e);
};

});