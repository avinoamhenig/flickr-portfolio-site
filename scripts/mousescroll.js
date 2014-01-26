jQuery.fn.mousescroll = function () {
	$(this).each(function (i, el) {
		var $el = $(el),
			elWidth, elOffsetX, elScrollWidth,
			scrollPadding = 100;

			$(window).on('resize', $.debounce(250, (function () {
				var handler = function () {
					elWidth = $el.outerWidth();
					elScrollWidth = $el[0].scrollWidth;
					elOffsetX = $el.offset().left;
				};

				handler();
				return handler;
			})()));

			$el.on('mousemove', $.throttle(5, function (e) {
				$el.scrollLeft(
					(elScrollWidth - elWidth) *
					Math.min(Math.max((e.pageX - elOffsetX - scrollPadding) / (elWidth - (scrollPadding * 2)), 0), 1)
				);
			}));
	});
};