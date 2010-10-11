$(document).ready(function () {


var run = function () {
    $("#points").text("0 Points");
    console.log("running …");
    var gb, vars = getUrlVars();
    var d = vars.difficulty || 6;
    if (d < 3) d = 3; else if (d > 6) d = 6;
    Dummy.points = function (c,p) {
        console.log(c,p)
        $("#points").text(gb.points+" Points");
    };
    gb = new GameBoard(0, ".gameboard", 23, vars.theme || "plain", d, true);
};

run();


});