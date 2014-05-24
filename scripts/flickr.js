/*
 * Ajax Flickr API helper - v0.1.0 alpha
 *
 * Depends on jQuery.
 *
 * Written by Avinoam Henig
 */

angular.module('ahFlickr', []).provider('ahFlickr', function AHFlickrProvider() {
	var apiKey = '';

	this.setApiKey = function (newKey) {
		apiKey = newKey;
	};

	this.$get = ['$http', function ($http) {
		var Flickr = function () {
			var Flickr = this, // Constant reference to this

			// Makes a request to the flickr api. Returns a promise.
			request = function (method, data) {
				return $http.jsonp('http://api.flickr.com/services/rest/', {
					params: angular.extend(data, {
						method: method,
						format: 'json',
						api_key: apiKey,
						jsoncallback: 'JSON_CALLBACK'
					})
				});
			};


			// User object. Just stores the user id.
			// In the future we could lazily make a request to get user info if necessary.
			this.FlickrUser = function (userId) {
				this.userId = userId;

				// Get all the user's sets. Returns a promise.
				this.sets = function () {
					var user = this;

					return request('flickr.photosets.getList', {
						user_id: user.userId
					}).then(function (data) {
						// Construct and return array of FlickrSet objects from json data.
						return $.map(data.data.photosets.photoset, function (data) {
							return new Flickr.FlickrSet(data, user);
						});
					});
				};
			};

			// An object that represents a photo set.
			// Holds json photoset info in data property.
			this.FlickrSet = function (data, user) {
				// Property to store raw json response data from flickr.
				this.data = data;

				// Store reference to the owner of the set.
				this.user = user;

				// Set properties
				this.title = this.data.title._content;
				this.urlTitle = this.title.toLowerCase().replace(/\W/g, '-');

				// Returns the url of the primary image of the set.
				// Size accepts either 's' (75px square) or 'q' (150px square)
				// Technically accepts other size identifiers, but I recommend against using them.
				// Get the photo and photo sizes to show larger images.
				this.url = function (size) {
					return 'http://farm' + this.data.farm + '.staticflickr.com/' +
						this.data.server + '/' + this.data.primary + '_' + this.data.secret + '_' + size + '.jpg';
				};

				// Get all the photos in the set. Reeturns a promise.
				this.photos = function () {
					var set = this;

					return request('flickr.photosets.getPhotos', {
						photoset_id: set.data.id,
						extras: 'url_t, url_s, url_m, url_o'
					}).then(function (data) {
						// Construct and return array of FlickrPhoto objects from json data.
						return $.map(data.data.photoset.photo, function (data) {
							return new Flickr.FlickrPhoto(data, set);
						});
					});
				};
			};

			// An object that represents a photo.
			// Holds json photo info in data property.
			this.FlickrPhoto = function (data, set) {
				// Reference to this for use inside callbacks.
				var photo = this;

				// Property to store raw json response data from flickr.
				this.data = data;

				// Store reference to parent entities.
				this.set = set;
				this.user = set.user;

				// Generate and store map of heights to widths and urls.
				// For use in the getting the best url for a desired height.
				// And calculating the aspect ratio with the largest dimensions for maximum accuracy.
				this.heights = {};
				$.each('tsmo'.split(''), function (i, sizeId) { // Generate map using urls returned in photosets.getPhotos response
																// json. Could also generate this by getting the photoSizes from flickr,
																// but that requires another round trip to the server for each photo.
					if ('url_' + sizeId in data) {
						photo.heights[parseInt(data['height_' + sizeId], 10)] = {
							url: data['url_' + sizeId],
							width: data['width_' + sizeId]
						};
					}
				});

				// Calculate and store the aspect ratio of the image (width/height).
				// Get keys (heights) of this.heights and sort them desc.
				// Retrieve the largest and calculate aspect ratio with those dimensions for max accuracy.
				this.aspect = (function (height) {
					return photo.heights[height].width / height;
				})($.map(photo.heights, function (url, height) {
					return parseInt(height, 10);
				}).sort(function (a, b) {
					return a > b ? -1 : 1;
				})[0]);

				// Returns the best url for any given height.
				this.urlForHeight = function (desiredHeight, maxUpscale) {
					var bestFit;

					if (maxUpscale === undefined) {
						maxUpscale = 2;
					} else if (!maxUpscale) {
						maxUpscale = 0;
					}

					// Find best fit height. The rule is the smallest one that is larger than desiredHeight.
					// If none are larger than it will use the largest one.
					$.each(

						// Get keys (heights) of this.heights and sort them desc.
						$.map(photo.heights, function (val, height) {
							return parseInt(height, 10);
						}).sort(function (a, b) {
							return a > b ? -1 : 1;
						}),

						function (i, height) {
							// If the height is less than desiredHeight then we are done. Unless it's the largest height
							// (i === 0), in which case we use that one.
							if (height < desiredHeight && i !== 0) {

								// If the difference is less than the difference between the desired height and the larger (previous) height,
								// and it's close enough to the desired height, then use the smaller height.
								if ((height * maxUpscale >= desiredHeight) && (Math.abs(height - desiredHeight) < Math.abs(bestFit - desiredHeight))) {
									bestFit = height;
								}

								return false;
							}

							// Keep track of bestFit so far.
							bestFit = height;
						}
					);

					// Return the url for the best height fit.
					return photo.heights[bestFit].url;
				};

				// Returns the best url for any given width.
				this.urlForWidth = function (desiredWidth, maxUpscale) {
					return this.urlForHeight(desiredWidth / this.aspect, maxUpscale);
				};

				this.heightForURL = function (url) {
					var urlHeight = false;
					$.each(photo.heights, function (height, val) {
						if (val.url == url) {
							urlHeight = parseInt(height, 10);
							return false;
						}
					});

					return urlHeight;
				};
			};

			// This convienence method returns a FlickrUser object for the given userId.
			// Use the user object to retrieve sets and/or photos for that given user.
			this.user = function (userId) {
				return new Flickr.FlickrUser(userId);
			};
		};

		return new Flickr();
	}];
});
