;(function ($) {
	"use strict";

	var ready = (function () {
		var deferred = new $.Deferred();
		$(deferred.resolve);
		return deferred.promise().then;
	})(),

	loaded = (function () {
		var deferred = new $.Deferred();
		$(window).load(deferred.resolve);
		return deferred.promise().then;
	})();


	Flickr.apiKey = '467ae0f24f47cf186bd6a5367c68048c';
	Flickr.user('52767238@N02').sets().then(function (sets) {
		ready(function () {

			$.each(sets, function (i, set) {
				var $img = $('<img>');

				$img.attr('src', set.url('q')).insertBefore('.arrow').on('click.loadGallery', function () {
					set.photos().then(function (photos) {
						var $photosContainer = $('.photos');
						$photosContainer.html('');
						$.each(photos, function (i, photo) {
							$('<img>').attr('src', photo.url()).appendTo($photosContainer);
						});
					});

					$('img.selected').removeClass('selected');
					$img.addClass('selected');

					$('.arrow').animate({
						// right: ($(window).width() - $img.offset().left) - ($img.width() / 2) - 13
						right: ($(window).width() - $img.offset().left) - $img.width()
					}, 200);
				});

				loaded(function () {
					$('.sets img').eq(0).trigger('click.loadGallery');
				});
			});
		});
	});

})(jQuery);


// Google analytics.
var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
(function (d,t) {
	var g=d.createElement(t),
		s=d.getElementsByTagName(t)[0];
	g.src='//www.google-analytics.com/ga.js';
	s.parentNode.insertBefore(g,s);
}(document,'script'));
