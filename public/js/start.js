$(document).ready(function () {

var selected = "plain";
var difficulty = 6;

["plain", "web"].forEach(function (name) {
    var link = $("<a>").attr({href:"#", id:name}).css({
            border:"5px solid white",
            padding:"6px",
            width: 6*18,
            display:"block"
    }).hover(function () { // in
        $(this).css({border:"5px solid "+(selected===name&&"red"||"gold")});
    }, function () { // out
        $(this).css({border:"5px solid "+(selected===name&&"orange"||"white")});
    });
    ["a", "b", "c", "d", "e", "f"].forEach(function (pn) {
        $("<img>").attr({
            src:"/img/"+name+"/"+pn+".png",
            width:18,
            height:18
        }).appendTo(link);
    });
    link.click(function () {
        $("#"+selected).css({border:"5px solid white"});
        selected = name;
        $(this).css({border:"5px solid red"});
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
        return false;
    }).appendTo($(".difficulty")).append(nr);

});

$("#dif6").css({border:"5px solid orange"});

});