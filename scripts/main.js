;(function ($) {
	"use strict";

	var

	/*** DOM ready and loaded promises ***/
	ready = (function () {
		var deferred = new $.Deferred();
		$(deferred.resolve);
		return deferred.promise().then;
	})(),
	loaded = (function () {
		var deferred = new $.Deferred();
		$(window).load(deferred.resolve);
		return deferred.promise().then;
	})(),

	// DOM Elements
	$photos = $('.photos'),
	$sets = $('.sets'),
	$arrow = $('.arrow');

	// Set the flickr api key
	Flickr.apiKey = config.flickr.apiKey;

	Flickr.user(config.flickr.userId).sets().then(function (sets) {
		/*** Insert Set Thumbnails ***/
		ready(function () {
			$.each(sets, function (i, set) {
				$('<img>')
					.attr({
						'src': set.url('q'),
						'title': set.title,
						'data-url': set.urlTitle
					}).data('set', set)
					.insertBefore('.arrow');
			});
		});

		/*** Mousecroll Sets ***/
		loaded(function () {
			$sets.mousescroll();
		});

		/*** Load Set On Click ***/
		$sets.on('click.loadGallery', 'img', function () {
			window.location.hash = $(this).data('set').urlTitle;
		});

		/*** Initial Navigation **/
		loaded(function () {
			if (!window.location.hash){
				window.location.hash = $sets.find('img').eq(0).data('set').urlTitle;
			} else {
				$(window).hashchange();
			}
		});
	});

	/*** Hashchange Navigation ***/
	$(window).hashchange(function () {
		var match = window.location.hash.slice(1).match(/^([^\/]*)(\/(.*))?$/),
			set = match[1],
			photo = match[3];

		if (set !== gallery.loadedSet) {
			// Highlight thumbnail
			var $selected = $sets.find('img.selected'),
				$set = $sets.find('[data-url="' + set + '"]');

			if (!$set.length) {
				$set = $sets.find('img').eq(0);
				window.location.hash = set = $set.data('set').urlTitle;
			}

			$selected.removeClass('selected');
			$set.addClass('selected');

			// Move arrow
			$arrow.animate({
				right: $sets[0].scrollWidth - $set.position().left - $sets.scrollLeft() - $arrow.width()
			}, !$selected.length ? 0 : 200);

			// Load gallery
			gallery.load(set, photo);
		} else if (photo) {
			gallery.loadOverlay(photo);
		} else {
			gallery.hideOverlay();
		}
	});

	/*** Ajax Loader ***/
	ready(function () {
		$(window).on('resize.layoutLoader', (function () {
			var handler = function () {
				$('.loader').css({
					top: ($(window).height() / 2) - $photos.offset().top - 50,
					left: ($(window).width() / 2) - 64
				});
			};

			handler();
			return $.debounce(250, handler);
		})());

		$(document).ajaxStart(function () {
			$('.loader').fadeIn(300);
		}).ajaxStop(function () {
			$('.loader').fadeOut(300);
		});
	});

	$photos.on('click.showOverlay', 'img', function () {
		window.location.hash = window.location.hash.slice(1).replace(/(\/.*)?$/, '/' + $(this).data('url'));
	});
	$('.overlay img.big').on('load.showBig', function () {
		$(this).show();
		$('.overlay img.small').hide();
	});
	$('.overlay').on('click.hideOverlay', function () {
		window.location.hash = window.location.hash.slice(1).replace(/\/.*$/, '');
	});

})(jQuery);
