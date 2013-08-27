module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-nodemon');

	grunt.initConfig({
		nodemon: {
			dev: {}
		}
	});

	grunt.registerTask('default', ['nodemon']);
};