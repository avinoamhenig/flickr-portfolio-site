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
	$arrow = $('.arrow'),
	$overlay = $('.overlay');

	// Set the flickr api key
	Flickr.apiKey = config.flickr.apiKey;

	Flickr.user(config.flickr.userId).sets().then(function (sets) {
		/*** Insert Set Thumbnails ***/
		ready(function () {
			$.each(sets, function (i, set) {
				var $img = $('<img>');

				$img.attr({
					'src': set.url('q'),
					'title': set.title,
					'data-url': set.urlTitle.replace(/\W/g, '-')
				}).data('set', set).insertBefore('.arrow');
			});
		});

		/*** Mousescroll Sets ***/
		loaded(function () {
			var setsWidth, setsOffsetX, setsScrollWidth,
				scrollPadding = 100;

			$(window).on('resize.updateAutoScrollVars', $.debounce(250, (function () {
				var handler = function () {
					setsWidth = $sets.outerWidth() - $arrow.width();
					setsScrollWidth = $sets[0].scrollWidth - $arrow.width();
					setsOffsetX = $sets.offset().left;
				};

				handler();
				return handler;
			})()));

			$sets.on('mousemove', $.throttle(5, function (e) {
				$sets.scrollLeft(
					(setsScrollWidth - setsWidth) *
					Math.min(Math.max((e.pageX - setsOffsetX - scrollPadding) / (setsWidth - (scrollPadding * 2)), 0), 1)
				);
			}));
		});

		/*** Load Set On Click ***/
		$sets.on('click.loadGallery', 'img', function () {
			var selected = $sets.find('img.selected'),
				$this = $(this);

			if ($this.hasClass('selected')) return;

			selected.removeClass('selected');
			$this.addClass('selected');

			// Move arrow
			$arrow.animate({
				right: $sets[0].scrollWidth - $this.position().left - $sets.scrollLeft() - $arrow.width()
			}, !selected.length ? 0 : 200);

			// Update URL
			window.location.hash = $this.data('set').urlTitle.replace(/\W/g, '-');
		});

		/*** Initial Navigation **/
		loaded(function () {
			var $set = $sets.find('img[data-url="' + window.location.hash.slice(1).match(/^([^\/]*)(\/(.*))?$/)[1] + '"]');
			if (!$set.length) {
				$set = $sets.find('img').first().trigger('click.loadGallery');
			}

			$(window).hashchange();
			$set.trigger('click.loadGallery');
		});
	});

	/*** Hashchange Navigation ***/
	$(window).hashchange(function () {
		var match = window.location.hash.slice(1).match(/^([^\/]*)(\/(.*))?$/),
			set = match[1],
			photo = match[3];

		if (set && set !== gallery.loadedSet) {
			gallery.load(set);
		}

		if (photo) {
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
