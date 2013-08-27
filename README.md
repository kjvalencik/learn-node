Learn Node.js
=============

Introduction
------------

From [nodejs.org](http://nodejs.org):

*"Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications.
Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive
real-time applications that run across distributed devices."*

One of the greatest benefits of node.js, simply, is that you already know the language. You no longer need to switch
between languages when writing server side and client side code. How many times have you grumbled to yourself while
writing that form validation logic a second time? In fact, if carefully engineered, it is even possible to share code
between client and server.

About this tutorial
-------------------

This tutorial will attempt to step you through your first node.js application. Along the way, you will learn some of the
common patterns of an asynchronous callback driven language, as well as some of the pitfalls, while being introduced to popular
libraries. Code examples for each chapter can be found within each folder.

At any point, you can reset your code back to a clean state with:

	git reset HEAD --hard

Table of Contents
-----------------

1. [NPM and CommonJS](#chapter-1-npm-and-commonjs)
2. [Express](#chapter-2-express)
3. [Grunt](#chapter-3-grunt)
4. [Blocking and non-blocking code](#chapter-4-blocking-and-non-blocking-code)
5. [Web Sockets](#chapter-5-web-sockets)
6. [Sharing code between client and server](#chapter-6-sharing-code-between-client-and-server)

Chapter 0: Installing
---------------------

### Ubuntu

I recommend Chris Lea's repository:

	sudo add-apt-repository ppa:chris-lea/node.js
	sudo apt-get update
	sudo apt-get install nodejs

### Mac

Prerequisite: Install [Xcode](https://developer.apple.com/xcode/)

Package: [Download](http://nodejs.org/download/)

Or

1. Install [brew](https://github.com/mxcl/homebrew)
2. `brew install node`

Or

	git clone git://github.com/ry/node.git
	cd node
	./configure
	make
	sudo make install

### Windows

Prerequisite: Install [Visual Studio](http://www.microsoft.com/visualstudio)

Binary: [Download](http://nodejs.org/download/)

[Back To Top](#table-of-contents)

Chapter 1: NPM and CommonJS
---------------------------

NPM (node package manager) is used to manage node applications and their dependencies. Create a new package.json file:

	npm init

Write your first node.js application. Create index.js:

	var text = process.argv[2] || 'world';
	console.log('Hello, ' + text + '!');

Run:

	node index K.J.

[CommonJS](http://wiki.commonjs.org/wiki/CommonJS) is the dependency system used by node.js. Modules are loaded from
local files, modules installed in the local node_modules folder, and finally the global node_modules directory. Modules are
only loaded once per running instance of node.js. Each additional time a module is required, it is passed a reference to
the module.exports returned by the module.

Create a module, hello.js:

	var textDefault = 'world',
		hello;

	hello = function (text) {
		var text = text || textDefault;
		console.log('Hello, ' + text + '!');
	};

	module.exports = hello;

Update index.js to use your new module:

	var hello = require('./hello');

	hello(process.argv[2]);

[Back To Top](#table-of-contents)

Chapter 2: Express
------------------

[Express](http://expressjs.com/) is a popular web framework for node.js. Install it locally from npm and save it to your dependencies:

	npm install --save express

Express can also be installed globally and used as a command line tool to generate new express boilerplate. You may need to do this
as a super user (sudo) depending on your platform and permissions.

	npm install -g express

Try adding a dependency directly to package.json:

	"dependencies": {
	  "escape-html": "~1.0.0",
	  ...
	}

Install all packages in the package.json file:

	npm install

Update index.js to serve a page instead of logging to the console:

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

Update hello.js to return a string:

	var textDefault = 'world',
		hello;

	hello = function (text) {
		var text = text || textDefault;
		return 'Hello, ' + text + '!';
	};

	module.exports = hello;

Run `node index`

Test by hitting `http://localhost:3000/world` with a web browser.

*Note: Keep in mind, that since modules are not reloaded, you will need to restart your server for them to take effect.*

[Back To Top](#table-of-contents)

Chapter 3: Grunt
----------------

[Grunt](http://gruntjs.com/) is task runner / build tool for javascript. It is a modular framework for doing automation and as
everyone knows, more automation means less work.

You may have noticed in the previous exercise, that if you made any changes to your running node application that they would not
take effect until the server was restarted. This is because all script files are read once and then their module.exports are cached.
This makes development difficult. Let's make a grunt task to ease the pain.

Install the grunt command line tool (may need to run as super user):

	npm install -g grunt-cli

Install a few modules to help with our grunt task.

- grunt: Task runner
- grunt-nodemon: A grunt module that runs a node app and restarts when watched files change

	npm install --save grunt grunt-nodemon

Create Gruntfile.js:

	// Return a function that will be called by grunt-cli. Grunt
	// as an instance of the grunt tool.
	module.exports = function (grunt) {
		// Load the nodemon plugin
		grunt.loadNpmTasks('grunt-nodemon');

		// Configure each of our plugins
		grunt.initConfig({
			nodemon: {
				dev: {}
			}
		});

		// Create tasks that are run as "grunt task"
		// The 'default' task runs as "grunt"
		grunt.registerTask('default', ['nodemon']);
	};

Instead of running `node index`, run `grunt`

Notice that whenever javascript files are updated, the grunt task will automatically
restart node for you.

[Back To Top](#table-of-contents)

Chapter 4: Blocking and non-blocking code
-----------------------------------------

One thing to keep in mind when developing a node.js application is that javascript is single threaded. Any long requests
on the main event loop will block other operations until they complete. Let's update our express route to simulate a long
running task. Edit index.js:

	// Load the express module and create an express app
	var express = require('express'),
	        app = express(),
	        escape = require('escape-html');

	var hello = require('./hello'),
		routeHandler;

	routeHandler = function (req, res) {
		res.send('<h1>' + escape(hello(req.params.text)) + '</h1>');

		// Simulate a long running task
		var start = new Date();
		while (new Date() - start < 5000) {}
	};

	// Define some express routes
	app.get('/', routeHandler);
	app.get('/:text', routeHandler);

	// Start a web server
	app.listen(3000);

Test by visiting `http://localhost:3000/world`. Notice that after each page visit, no other pages can be served
for another 5 seconds while the request is blocking. Additional requests will continue to queue up, and wait times
will stack. However, node.js has a way of avoiding this: asynchronous, non-blocking, callback driven coding.
Let's rewrite our handler to prevent blocking:

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

`setImmediate` will take a function and place it onto the end of the event loop so that any events that are waiting
in the queue will be processed before the next iteration of the loop. This will prevent any requests from blocking
the response of new requests. Note: `setImmediate` is used where `process.nextTick` was formerly recommended.

[Back To Top](#table-of-contents)

Chapter 5: Web Sockets
----------------------

Web sockets are a feature of newer browsers. Essentially, they are http connections that are kept alive indefinitely so
that you may write event based code instead of polling for new data. Because web sockets are a newer feature, not all
web servers and not all web browsers support them. Both [nginx](http://nginx.org/) and [haproxy](http://haproxy.1wt.eu/)
have excellent support for web sockets. There are also client / server libraries such as [socket.io](http://socket.io/) and
[sockjs](http://sockjs.org) that take care of the fallback logic when working with web sockets.

In this example, you will use socket.io. Socket.io will first attempt to establish a native web socket connection, if that
fails, it will attempt to use a small flash application to establish the connection, and finally it will fall back to xhr
polling.

Let's create a new express application. If you have not installed the cli tool:

	npm install -g express

Create a new express application with ejs templates:

	express -e

This will generate all the necessary boilerplate. Install required modules:

	npm install

Copy Gruntfile.js from the previous excercise and install/save grunt and grunt-nodemon:

	npm install --save grunt grunt-nodemon

Update package.json so that grunt-nodemon knows which javascript file to execute:

	{
		...
		"main": "app.js",
		...
	}

Install the socket.io server module:

	npm install --save socket.io

Start the server `grunt`. You should now see a rendered version of `views/index.ejs` at `http://localhost:3000`

Update `views/index.ejs` to serve the socket.io client and a script file you are about to write.

	<!DOCTYPE html>
	<html>
		<head>
			<title>Socket.io Example</title>
			<link rel="stylesheet" href="stylesheets/style.css" />
			<script src="javascripts/script.js"></script>
			<script src="//cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js"></script>
		</head>
		<body></body>
	</html>

Add a placeholder for some content later on:

	<body>
		<h1 id="clock"></h1>
		<button id="start">Start</button>
		<button id="stop">Stop</button>
	</body>

You can create a socket.io server with as little code as `var io = require('socket.io').listen(3001);`. However,
if you would like socket.io to listen on the same port as your webserver, you will need to pass your express
server to `listen()` instead of a port number. Update app.js:

	var server = http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});
	var io = require('socket.io').listen(server);

You are now ready to start using sockets to pass data between browser and server. You are going to build a simple
server side clock. Start by creating the server side logic by appending to app.js:

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

When a new connection is received, the server will start sending time on the `time` channel. In addition, it will listen
for `start` and  `stop` on the same channel. When a `stop` command is received, updates stop being sent. When a `start` command
is received, updates begin being sent again. Finally, the code listens for the `disconnect` event and will stop time events to
prevent a leak when clients disconnect.

Next, we will create some client side code to connect to socket.io and begin updating the clock. Create public/javascripts/script.js:

	// Wait for the page to finish loading
	window.onload = function () {
		// Connect to socket.io
		var socket = io.connect(),
			clockEl = document.getElementById('clock');
	
		// Send a 'start' command on the time channel when the
		// start button is clicked
		document.getElementById('start').onclick = function () {
			socket.emit('time', 'start');
		};
	
		// Send a 'stop' command on the time channel when the
		// stop button is clicked
		document.getElementById('stop').onclick = function () {
			socket.emit('time', 'stop');
		};
	
		// Listen for time updates
		socket.on('time', function (data) {
			var time = new Date(data);
	
			// Update the clock with the last received time
			clockEl.innerHTML = time.getHours() +
				':' + ("0" + time.getMinutes()).slice(-2) +
				':' + ("0" + time.getSeconds()).slice(-2);
		});
	};

You should now have a fully functioning clock based on server side time.

[Back To Top](#table-of-contents)

Chapter 6: Sharing code between client and server
-------------------------------------------------

There really isn't a magic bullet for sharing code between the client and server. This is a much deeper topic
than the guide is intended; therefore, I will just share a few resources.

- [Underscore](http://underscorejs.org/): Functional library that will help prevent errors caused by
missing functionality in some browsers (e.g., `forEach()`)
- [Browserfy](https://github.com/substack/node-browserify): CommonJS style script loading for the browser
- [Rendr](https://github.com/airbnb/rendr): Backbone.js rendering for server and client

[Back To Top](#table-of-contents)

License
-------

This guide is released under the MIT License. If you have any suggestions please let me know or submit a pull request.