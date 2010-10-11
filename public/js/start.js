$(document).ready(function () {

var theme = "plain";
var difficulty = 6;


var ws = new WebSocket('ws://' + document.location.host + '/');
ws.onopen = function() {
    console.log('open');
};
ws.onmessage = function(ev) {
    console.log('msg: '+ev.data);
};
ws.onclose = function() {
    console.log('close');
};
ws.onerror = function(e) {
    console.error(e);
};


["plain", "web"].forEach(function (name) {
    var link = $("<a>").attr({href:"#", id:name}).css({
            border:"5px solid white",
            padding:"6px",
            width: 6*18,
            display:"block"
    }).hover(function () { // in
        $(this).css({border:"5px solid "+(theme===name&&"red"||"gold")});
    }, function () { // out
        $(this).css({border:"5px solid "+(theme===name&&"orange"||"white")});
    });
    ["a", "b", "c", "d", "e", "f"].forEach(function (pn) {
        $("<img>").attr({
            src:"/img/"+name+"/"+pn+".png",
            width:18,
            height:18
        }).appendTo(link);
    });
    link.click(function () {
        $("#"+theme).css({border:"5px solid white"});
        theme = name;
        $(this).css({border:"5px solid red"});
        ws.send("theme="+name);
        return false;
    }).appendTo($(".themes"));

});

$("#plain").css({border:"5px solid orange"});

[3, 4, 5, 6].forEach(function (nr) {
    var link = $("<a>").attr({href:"#", id:"dif"+nr}).css({
            border:"5px solid white",
            padding:"6px",
            float:"left",
            width: 6,
            display:"block"
    }).hover(function () { // in
        $(this).css({border:"5px solid "+(difficulty===nr&&"red"||"gold")});
    }, function () { // out
        $(this).css({border:"5px solid "+(difficulty===nr&&"orange"||"white")});
    }).click(function () {
        $("#dif"+difficulty).css({border:"5px solid white"});
        difficulty = nr;
        $(this).css({border:"5px solid red"});
        ws.send("difficulty="+nr);
        return false;
    }).appendTo($(".difficulty")).append(nr);

});

$("#dif6").css({border:"5px solid orange"});

$("#start").click(function () {
    $(this).attr("href", "/single?theme="+theme+"&difficulty="+difficulty);
    return true;
});

});