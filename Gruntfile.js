/**
 * Gruntile.js - Avionam Henig
 **/

module.exports = function (grunt) {

	var fs = require('fs'),
		extend = require('node.extend'),
		getMTime = function (path) {
			return (new Date(fs.statSync(path).mtime)).getTime();
		},
		getNewestMTime = function (dir) {
			var newest = 0;
			fs.readdirSync(dir).forEach(function (file) {
				var mtime = getMTime(dir + '/' + file);
				if (mtime > newest) newest = mtime;
			});
			return newest;
		},
		spec = {
			scripts: ['console', 'throttle', 'hashchange', 'flickr', 'simplecart', 'main', 'google_analytics'],
			jshint: ['console', 'flickr', 'main'],
			styles: 'style',
			jade: ['index']
		};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		mtime: {
			js: getNewestMTime('scripts'),
			css: getNewestMTime('styles')
		},

		clean: ['build/js', 'build/css', 'build/index.html', 'build/img'],

		jshint: {
			files: spec.jshint.map(function (name) {
				return 'scripts/' + name + '.js';
			})
        },

		concat: {
			scripts: {
				src: spec.scripts.map(function (name) {
					return 'scripts/' + name + '.js';
				}),
				dest: 'build/js/<%= mtime.js %>.scripts.min.js'
			}
		},

		uglify: {
			scripts: {
				files: {
					'<%= concat.scripts.dest %>': ['<%= concat.scripts.dest %>']
				}
			}
		},

		copy: {
			scripts: {
				files: spec.scripts.map(function (name) {
					return {
						src: 'scripts/' + name + '.js',
						dest: 'build/js/' + getMTime('scripts/' + name + '.js') + '.' + name + '.js'
					};
				})
			},
			copy: {
				files: [{expand: true, src: ['img/**'], dest: 'build/'},
						{src:'humans.txt', dest:'build/humans.txt'},
						{src:'robots.txt', dest:'build/robots.txt'},
						{src:'favicon.ico', dest:'build/favicon.ico'}]
			}
		},

		stylus: {
			build: {
				options: {
					import: ['nib'],
					paths: ['styles']
				},
				files: {
					'build/css/<%= mtime.css %>.style.min.css': 'styles/' + spec.styles + '.styl'
				}
			},
			dev: {
				options: {
					import: ['nib'],
					paths: ['styles'],
					compress: true
				},
				files: {
					'build/css/<%= mtime.css %>.style.css': 'styles/' + spec.styles + '.styl'
				}
			}
		},

		jade: {
			build: {
				files: extend.apply({}, spec.jade.map(function (name) {
					var r = {};
					r['build/' + name + '.html'] = 'views/' + name + '.jade';
					return r;
				})),
				options: {
					data: {
						styles: ['/css/<%= mtime.css %>.style.min.css'],
						scripts: ['/js/<%= mtime.js %>.scripts.min.js'],
						faviconVersion: getMTime('favicon.ico') + ''
					}
				}
			},
			dev: {
				files: extend.apply({}, spec.jade.map(function (name) {
					var r = {};
					r['build/' + name + '.html'] = 'views/' + name + '.jade';
					return r;
				})),
				options: {
					pretty: true,
					data: {
						styles: ['/css/<%= mtime.css %>.style.css'],
						scripts: spec.scripts.map(function (name) {
							return '/js/' + getMTime('scripts/' + name + '.js') + '.' + name + '.js';
						})
					}
				}
			}
		},

		watch: {
			files: ['scripts/*', 'styles/*', 'views/*'],
            tasks: ['clean', 'jshint', 'copy', 'stylus:dev', 'jade:dev']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', ['clean', 'jshint', 'copy:copy', 'concat', 'uglify', 'stylus:build', 'jade:build']);
	grunt.registerTask('dev', ['clean', 'jshint', 'copy', 'stylus:dev', 'jade:dev', 'watch']);
	grunt.registerTask('default', ['build']);
};
