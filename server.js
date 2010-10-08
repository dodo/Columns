

require.paths.unshift(__dirname + '/lib');
var express = require('express'),
    connect = require('connect'),


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
                jsfile: "start",
                title: "Columns",
            }
        });
    });

    app.get('/single', function(req, res){
        res.render('single.haml', {
            locals: {
                jsfile: "columns",
                title: "Columns",
            }
        });
    });

    // start

    if (!module.parent) {
        app.listen(parseInt(process.env.PORT) || 3000);
        console.log("server listening on port %d ...", app.address().port);
    }
}();