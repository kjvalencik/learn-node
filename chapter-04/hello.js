var textDefault = 'world',
	hello;

hello = function (text) {
	var text = text || textDefault;
	return 'Hello, ' + text + '!';
};

module.exports = hello;
