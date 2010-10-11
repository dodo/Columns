$(document).ready(function () {


var run = function () {
    console.log("running …");
    var vars = getUrlVars();
    var d = vars.difficulty || 6;
    if (d < 3) d = 3; else if (d > 6) d = 6;
    var gb = new GameBoard(0, ".gameboard", 23, vars.theme || "plain", d, true);
};

run();


});