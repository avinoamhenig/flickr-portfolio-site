;(function ($) {
	var $photos = $('.photos'),
		$sets = $('.sets'),
		photos; // Stores the array of FlickrPhoto objects for the currently selected set

	window.gallery = {
		// Maximum height for each row of photos
		maxHeight: 320,

		// Name (URL) of the currently loaded set
		loadedSet: '',

		// Load set
		load: function (set, photoId) {
			gallery.loadedSet = set;
			set = $sets.find('img[data-url="' + set + '"]').data('set');

			// Get photos
			var promise = set.photos();

			// Insert photos
			$photos.fadeOut(200, function() {
				promise.then(function (res) {
					photos = res;

					$photos.html('').show();
					$.each(photos, function (i, photo) {
						$('<img>')
							.data('photo', photo)
							.attr({
								'src': photo.urlForHeight(gallery.maxHeight),
								'data-url': photo.data.id
							})
							.appendTo($photos)
							.on('load', function () {
								$(this).addClass('loaded');
							});
					});

					if (photoId) {
						gallery.loadOverlay(photoId);
					}

					gallery.layout();
				});
			});
		},

		// Adjusts the sizes of the photos and inserts line breaks to lay them out nicely
		layout: function (mHeight) {
			if (!photos) return;
			if (typeof mHeight !== 'number') mHeight = gallery.maxHeight;

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

			if ((!eolIndexes.length || eolIndexes.length === photos.length - 1) && mHeight == gallery.maxHeight) {
				var rowAspect = 0;
				$.each(photos, function (i, photo) {
					rowAspect += photo.aspect;
				});


				return gallery.layout(
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
		},

		/*** Large Image Overlay ***/
		loadOverlay: function (photoId) {
			var $this = $photos.find('img[data-url="' + photoId + '"]');
			if (!$this.length) {
				return;
			}

			var photo = $this.data('photo'),
				padding = 0,
				layoutHandler = function () {
					var windowWidth = $(window).width(),
						windowHeight = $(window).height(),
						windowAspect = windowWidth / windowHeight,
						width = windowAspect < photo.aspect ? windowWidth - padding : (windowHeight * photo.aspect) - padding,
						height = width / photo.aspect,
						url = photo.urlForWidth($(window).width() - padding, 1.5),
						margin = (windowHeight / 2) - (height / 2),
						$bigImg = $('.overlay img.big'),
						$smallImg = $('.overlay img.small');

					if (url !== $bigImg.attr('src')) {
						$bigImg.hide();
						$smallImg
							.attr('src', $this.attr('src'))
							.width(width)
							.css('margin-top', margin)
							.show();
					}

					$bigImg
						.attr('src', url)
						.width(width)
						.css('margin-top', margin);
				};

			layoutHandler();
			$(window).on('resize.layoutOverlay', $.debounce(250, false, layoutHandler));

			$('.overlay').addClass('active');

			window.setTimeout(function () {
				$('body').css('overflow', 'hidden');
			}, 700);
		},

		hideOverlay: function() {
			$('body').css('overflow', 'auto');
			$(window).off('resize.layoutOverlay');
			$('.overlay').removeClass('active');
		}
	};

	// Re-layout images on window resize
	$(window).on('resize.layoutGallery', $.throttle(250, function () {
		gallery.layout(photos);
	}));
})(jQuery);
