var express = require('express'),
	routes = require('./routes'),
	http = require('http'),
	path = require('path');
	app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
var io = require('socket.io').listen(server);

// Ran when a client connects to socket.io
io.sockets.on('connection', function (socket) {
	var handle, sendTime, start, stop, startClock;

	// Send the current time to the client
	sendTime = function () {
		socket.emit('time', new Date());
	};

	// Send time updates every 250ms. Over sample to prevent
	// clock skew.
	start = function () {
		if (!handle) {
			handle = setInterval(sendTime, 250);
		}
	};

	// Stop the clock
	stop = function () {
		if (handle) {
			clearInterval(handle);
			handle = null;
		}
	};

	// Listen for clock start / stop events
	socket.on('time', function (cmd) {
		switch (cmd) {
		case "start":
			start();
			break;
		case "stop":
			stop();
			break;
		}
	});

	socket.on('disconnect', function () {
		stop();
	});

	// As soon as a connection is established, start sending
	// time updates.
	start();
});