// Load the express module and create an express app
var express = require('express'),
        app = express(),
        escape = require('escape-html');
	
var hello = require('./hello'),
	routeHandler;
	
routeHandler = function (req, res) {
	res.send('<h1>' + escape(hello(req.params.text)) + '</h1>');

	// Simulate a long running task
	var start = new Date(),
		runTask;

	runTask = function () {
		if (new Date() - start < 5000) {
			setImmediate(runTask);
		}
	};
	runTask();
}
	
// Define some express routes
app.get('/', routeHandler);
app.get('/:text', routeHandler);
	
// Start a web server
app.listen(3000);
