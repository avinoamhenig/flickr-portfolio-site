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

	// Maximum height for each row of photos
	maxHeight = 320,

	// Stores the array of FlickrPhoto objects for the currently selected set
	photos,

	// DOM Elements
	$photos = $('.photos'),
	$sets = $('.sets'),
	$arrow = $('.arrow'),

	// Adjusts the sizes of the photos and inserts breaks to lay them out nicely
	layoutImages = function (mHeight) {
		if (!photos) return;
		if (typeof mHeight !== 'number') mHeight = maxHeight;

		var windowWidth = $(window).width(),
			$images = $photos.find('img'),
			eolIndexes = [],
			heightMap = (function () {
				var map = [],
					layoutRow = function (startIndex) {
						var i = startIndex, j,
							rowWidth = 6;

						do {
							if (i === photos.length) break;

							rowWidth += (mHeight * photos[i].aspect) + 10;
							i++;
						} while (rowWidth < windowWidth);

						if (rowWidth < windowWidth) {
							for (j = startIndex; j < i; j++)
								map[j] = mHeight;
						} else {
							for (j = startIndex; j < i; j++)
								map[j] = (mHeight / rowWidth) * windowWidth;
						}

						if (i === photos.length) return;

						eolIndexes.push(i - 1);
						layoutRow(i);
					};

				layoutRow(0);
				return map;
			})();

		if ((!eolIndexes.length || eolIndexes.length === photos.length - 1) && mHeight == maxHeight) {
			var rowAspect = 0;
			$.each(photos, function (i, photo) {
				rowAspect += photo.aspect;
			});


			return layoutImages(
				Math.min(
					$(window).height() - 114,
					Math.max(
						($(window).height() - 114) / Math.max(1, photos.length - 0.25),
						$(window).width() / rowAspect)));
		}

		$photos.find('br').remove();
		$.each(heightMap, function (i, height) {
			$images.eq(i)
				.attr('src', photos[i].urlForHeight(height))
				.attr('height', height)
				.attr('width', (photos[i].aspect * height));

			if (eolIndexes.indexOf(i) !== -1) {
				$('<br>').insertAfter($images.eq(i));
			}
		});
	};

	// Re-layout images on window resize
	$(window).on('resize.layoutImages', $.throttle(250, layoutImages));

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
					'data-url': set.urlTitle
				}).data('set', set).insertBefore('.arrow');
			});
		});

		/*** Load Set ***/
		$sets.on('click.loadGallery', 'img', function () {
			var $img = $(this),
				set = $img.data('set'),
				selected = $sets.find('img.selected'),
				promise;

			if ($img.hasClass('selected')) return;

			// Get photos and insert them
			promise = set.photos();
			$photos.fadeOut(200, function() {
				promise.then(function (res) {
					photos = res;

					$photos.html('').show();
					$.each(photos, function (i, photo) {
						$('<img>')
							.data('photo', photo)
							.attr('src', photo.urlForHeight(maxHeight))
							.appendTo($photos)
							.on('load', function () {
								// $(this).animate({opacity: 1}, 350);
								$(this).addClass('loaded');
							});
					});

					layoutImages();
				});
			});

			// Update URL
			window.location.hash = set.urlTitle;

			selected.removeClass('selected');
			$img.addClass('selected');

			// Move arrow
			$arrow.animate({
				right: $sets[0].scrollWidth - $img.position().left - $sets.scrollLeft() - $arrow.width()
			}, !selected.length ? 0 : 200);
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
	});

	/*** Change Set on Hashchange ***/
	$(window).hashchange(function () {
		$sets.find('img[data-url="' + window.location.hash.slice(1) + '"]').trigger('click.loadGallery');
	});

	/*** Load Initial Set ***/
	loaded(function () {
		var $currentImg = $sets.find('img[data-url="' + window.location.hash.slice(1) + '"]'),
			$firstSetImg = $sets.find('img').eq(0);

		if ($currentImg.length) $currentImg.trigger('click.loadGallery');
		else $firstSetImg.trigger('click.loadGallery');
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

	/*** Large Image Overlay ***/
	$photos.on('click.showOverlay', 'img', function () {
		var $this = $(this),
			photo = $this.data('photo'),
			padding = 0,
			layoutHandler = function () {
				var windowWidth = $(window).width(),
					windowHeight = $(window).height(),
					windowAspect = windowWidth / windowHeight,
					width = windowAspect < photo.aspect ? windowWidth - padding : (windowHeight * photo.aspect) - padding,
					height = width / photo.aspect,
					url = photo.urlForWidth($(window).width() - padding),
					margin = (windowHeight / 2) - (height / 2);

				$('.overlay img')
					.attr('src', url)
					.width(width)
					.css('margin-top', margin);
			};

		layoutHandler();
		$(window).on('resize.layoutOverlay', $.debounce(250, false, layoutHandler));

		$('.overlay').fadeIn(300);
	});
	$('.overlay').on('click', function () {
		$(window).off('resize.layoutOverlay');
		$(this).fadeOut(200);
	});

})(jQuery);
