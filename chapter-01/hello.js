var textDefault = 'world',
	hello;

hello = function (text) {
	var text = text || textDefault;
	console.log('Hello, ' + text + '!');
};

module.exports = hello;
