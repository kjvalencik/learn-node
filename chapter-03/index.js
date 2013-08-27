// Load the express module and create an express app
var express = require('express'),
	app = express(),
	escape = require('escape-html');

var hello = require('./hello');

// Define some express routes
app.get('/', function (req, res) {
	res.send('<h1>' + hello() + '</h1>');
});
app.get('/:text', function (req, res){
	res.send('<h1>' + escape(hello(req.params.text)) + '</h1>');
});

// Start a web server
app.listen(3000);