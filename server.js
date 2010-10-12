

require.paths.unshift(__dirname + '/lib');
var express = require('express'),
    connect = require('connect'),
    socket  = require('spacesocket/lib/spacesocket'),
    connections = {},

// helper

genId = function () {
    return (((1+Math.random())*0x10000)|0).toString(16);
},

// main

_ = function () {
    var app = module.exports = express.createServer();

    // configuration

    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.use(connect.bodyDecoder());
        app.use(connect.methodOverride());
        app.use(connect.compiler({ src: __dirname + '/public', enable: ['less'] }));
        app.use(app.router);
        app.use(connect.staticProvider(__dirname + '/public'));
    });

    app.configure('development', function(){
        app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function(){
       app.use(connect.errorHandler());
    });

    // routes

    app.get('/', function(req, res){
        res.render('index.haml', {
            locals: {
                jsfiles: ["start"],
                title: "Columns",
            }
        });
    });

    app.get('/single', function(req, res){
        res.render('single.haml', {
            locals: {
                jsfiles: ["columns", "single"],
                title: "Columns",
            }
        });
    });

    app.get('/multi', function(req, res){
        res.render('multi.haml', {
            locals: {
                jsfiles: ["columns", "multi"],
                title: "Columns",
            }
        });
    });

    // start

    if (!module.parent) {
        app.listen(parseInt(process.env.PORT) || 3000);
        socket.attach(app, function (conn) {
            var clientid, id = genId();
            connections[id] = conn;
            var broadcast = function (msg) {
                Object.keys(connections).forEach(function (key) {
                    if (key !== id) connections[key].write(msg);
                });
            };
            conn.on('data', function (msg) {
                broadcast(msg);
                if(msg.slice(0, 2) === "me")
                    clientid = msg.split(":")[1];
            });
            conn.on('close', function () {
                if (clientid) broadcast("cl:"+clientid);
                delete connections[id];
            });
        });
        console.log("server listening on port %d ...", app.address().port);
    }
}();