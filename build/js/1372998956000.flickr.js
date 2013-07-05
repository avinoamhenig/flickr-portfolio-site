/*
 * Ajax Flickr API helper - v0.1.0 alpha
 *
 * Depends on jQuery.
 *
 * Written by Avinoam Henig
 */

;(function ($, undefined) {
	"use strict";

	var

	// User object. Just stores the user id.
	// In the future we could lazily make a request to get user info if necessary.
	FlickrUser = function (userId) {
		this.userId = userId;
	},

	// An object that represents a photo set.
	// Holds json photoset info in data property.
	FlickrSet = function (data, user) {
		this.data = data;
		this.user = user;
	},

	// An object that represents a photo.
	// Holds json photo info in data property.
	FlickrPhoto = function (data, set) {
		this.data = data;
		this.set = set;
		this.user = set.user;
	},

	// Flickr photo sizes from smallest to largest
	sizes = 'sqtmn-zcbo'.split(''),

	// Make a request to the flickr api. Returns a promise.
	request = function (method, data) {
		data.method = method;
		data.format = 'json';
		data.api_key = Flickr.apiKey;

		return $.ajax(Flickr.restApiUrl, {
			data: data,
			dataType: 'jsonp',
			jsonpCallback: Flickr.jsonpCallback
		});
	};

	// Main api entry point.
	window.Flickr = {
		// Your apps flickr api key.
		apiKey: '',

		// This method returns a FlickrUser object for the given userId.
		// Use the user object to retrieve sets and/or photos for that given user.
		user: function (userId) {
			return new FlickrUser(userId);
		},

		restApiUrl: 'http://api.flickr.com/services/rest/', // The flickr rest api url.
		jsonpCallback: 'jsonFlickrApi' // Callback name to use for flickr jsonp requests.
	};

	// Get all the user's sets. Returns a promise.
	FlickrUser.prototype.sets = function () {
		var user = this;

		return request('flickr.photosets.getList', {
			user_id: user.userId
		}).then(function (data) {
			// Construct and return array of FlickrSet objects from json data.
			return $.map(data.photosets.photoset, function (data) {
				return new FlickrSet(data, user);
			});
		});
	};

	// Returns the url of the primary image of the set.
	// Size accepts either Flickr.size constant or an integer of longest side.
	FlickrSet.prototype.url = function (size) {
		return 'http://farm' + this.data.farm + '.staticflickr.com/' +
			this.data.server + '/' + this.data.primary + '_' + this.data.secret + '_' + size + '.jpg';
	};

	// Get all the photos in the set. Reeturns a promise.
	FlickrSet.prototype.photos = function () {
		var set = this;

		return request('flickr.photosets.getPhotos', {
			photoset_id: set.data.id,
			extras: 'url_sq, url_t, url_s, url_m, url_o, o_dims, original_format'
		}).then(function (data) {
			// Construct and return array of FlickrPhoto objects from json data.
			return $.map(data.photoset.photo, function (data) {
				return new FlickrPhoto(data, set);
			});
		});
	};

	// Returns the url of the primary image of the set.
	// Size accepts either Flickr.size constant or an integer of longest side.
	FlickrPhoto.prototype.url = function (size) {
		return this.data.url_m;
	};

})(jQuery);
