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

			return option ? extend(true, config.default, config[option]) : config.default;
		})(),

		spec = (function () {
			var jshint = function (path) {
					toJsHint.push(path);
					return path;
				}, toJsHint = [];

			return {
				files: {
					js: [
						'bower_components/jquery-throttle-debounce/jquery.ba-throttle-debounce',

						'app/scripts/google_analytics',

						jshint('app/scripts/whenpageis'),
						jshint('app/scripts/ahPromises'),
						jshint('app/scripts/ahFlickr'),

						jshint('app/directives/ah-sets/ahSets'),
						jshint('app/directives/ah-photo/ahPhoto'),
						jshint('app/directives/ah-paypal/ahPaypal'),
						jshint('app/directives/ah-image-options/ahImageOptions'),

						jshint('app/app'),

						jshint('app/routes/gallery/GalleryController')
					],
					styl: ['app/styles/style'],
					jade: ['app/index']
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
					paths: ['app'],
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
					basedir: 'app',
					data: {
						config: config,
						styles: ['/styles/<%= reducedModifiedTimes.styl %>.style.css'],
						scripts: ['/scripts/<%= reducedModifiedTimes.js %>.scripts.min.js'],
						faviconUrl: '/' + getModifiedTime('favicon.ico') + '.favicon.ico'
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
					basedir: 'app',
					data: {
						config: config,
						styles: spec.files.styl.map(function (name) {
							return '/styles/' + modifiedTimes.styl[name] + '.' + filename(name) + '.css';
						}),
						scripts: spec.files.js.map(function (name) {
							return '/scripts/' + modifiedTimes.js[name] + '.' + filename(name) + '.js';
						}),
						faviconUrl: '/' + getModifiedTime('favicon.ico') + '.favicon.ico'
					}
				}
			}
		},

		watch: {
			files: ['app/**'],
			tasks: ['clean', 'jshint', 'copy', 'stylus', 'jade:dev']
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
