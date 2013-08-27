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