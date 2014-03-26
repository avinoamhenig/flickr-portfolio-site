/**
 * Gruntile.js - Avionam Henig
 **/

module.exports = function (grunt) {

	var fs = require('fs'),
		extend = require('node.extend'),
		getModifiedTime = function (path) {
			return (new Date(fs.statSync(path).mtime)).getTime();
		},
		filename = function (path) {
			return path.match(/\/([^\/]+)$/)[1];
		},

		config = (function () {
			var config = grunt.file.readJSON('config.json'),
				option = grunt.option('config');

			return option ? extend(true, config.default, config[option]).default : config.default;
		})(),

		spec = (function () {
			var jshint = function (path) {
					toJsHint.push(path);
					return path;
				}, toJsHint = [],

				scripts = 'scripts/',
				bower = 'bower_components/',
				styles = 'styles/',
				views = 'views/';

			return {
				files: {
					js: [
						bower + 'jquery-throttle-debounce/jquery.ba-throttle-debounce',
						bower + 'jquery-hashchange/jquery.ba-hashchange',
						jshint(scripts + 'mousescroll'),
						jshint(scripts + 'flickr'),
						jshint(scripts + 'gallery'),
						jshint(scripts + 'main'),
						scripts + 'google_analytics'
					],
					styl: [
						styles + 'style'
					],
					jade: [
						views + 'index'
					]
				},

				jshint: toJsHint
			};
		})(),

		modifiedTimes = Object.keys(spec.files).reduce(function (obj, key) {
			obj[key] = spec.files[key].reduce(function (obj, path) {
				obj[path] = getModifiedTime(path + '.' + key);
				return obj;
			}, {});

			return obj;
		}, {});


	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		reducedModifiedTimes: Object.keys(modifiedTimes).reduce(function (obj, key) {
			obj[key] = Math.max.apply(Math, Object.keys(modifiedTimes[key]).map(function (path) {
				return modifiedTimes[key][path];
			}));

			return obj;
		}, {}),


		clean: ['build'],

		jshint: {
			files: spec.jshint.map(function (name) {
				return name + '.js';
			})
		},

		concat: {
			scripts: {
				src: spec.files.js.map(function (name) {
					return name + '.js';
				}),
				dest: 'build/scripts/<%= reducedModifiedTimes.js %>.scripts.min.js'
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
				files: spec.files.js.map(function (name) {
					return {
						src: name + '.js',
						dest: 'build/scripts/' + modifiedTimes.js[name] + '.' + filename(name) + '.js'
					};
				})
			},
			copy: {
				files: [{expand: true, src: ['img/**'], dest: 'build/'},
						{src:'humans.txt', dest:'build/humans.txt'},
						{src:'robots.txt', dest:'build/robots.txt'},
						{src:'favicon.ico', dest:'build/' + getModifiedTime('favicon.ico') + '.favicon.ico'}]
			}
		},

		stylus: {
			build: {
				options: {
					import: ['nib'],
					paths: ['styles'],
					compress: true
				},
				files: spec.files.styl.reduce(function (obj, name) {
					obj['build/styles/' + modifiedTimes.styl[name] + '.' + filename(name) + '.css'] = name + '.styl';
					return obj;
				}, {})
			}
		},

		jade: {
			build: {
				files: extend.apply({}, spec.files.jade.map(function (name) {
					var r = {};
					r['build/' + filename(name) + '.html'] = name + '.jade';
					return r;
				})),
				options: {
					data: {
						config: config,
						styles: ['/styles/<%= reducedModifiedTimes.styl %>.style.min.css'],
						scripts: ['/scripts/<%= reducedModifiedTimes.js %>.scripts.min.js'],
						faviconUrl: '/' + getModifiedTime('favicon.ico') + 'favicon.ico'
					}
				}
			},
			dev: {
				files: extend.apply({}, spec.files.jade.map(function (name) {
					var r = {};
					r['build/' + filename(name) + '.html'] = name + '.jade';
					return r;
				})),
				options: {
					pretty: true,
					data: {
						config: config,
						styles: spec.files.styl.map(function (name) {
							return '/styles/' + modifiedTimes.styl[name] + '.' + filename(name) + '.css';
						}),
						scripts: spec.files.js.map(function (name) {
							return '/scripts/' + modifiedTimes.js[name] + '.' + filename(name) + '.js';
						}),
						faviconUrl: '/' + getModifiedTime('favicon.ico') + 'favicon.ico'
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

	grunt.registerTask('build', ['clean', 'jshint', 'copy:copy', 'concat', 'uglify', 'stylus', 'jade:build']);
	grunt.registerTask('dev', ['clean', 'jshint', 'copy', 'stylus', 'jade:dev', 'watch']);
	grunt.registerTask('default', ['build']);

};
