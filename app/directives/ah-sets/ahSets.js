angular.module('ahSets', [
	'whenPageIs'
])

.directive('ahSets', ['$window', 'whenPageIs', '$routeParams', function ($window, whenPageIs, $routeParams) {
	return {
		restrict: 'AE',
		scope: {
			sets: '=',
			selectedSet: '='
		},
		templateUrl: 'directives/ah-sets',
		link: function (scope, element) {

			/*** Mouse Scroll ***/
			var $arrow = $('.arrow'),
				elWidth, elOffsetX, elScrollWidth, scrollPadding = 100,
				updateMouseScrollValues = function () {
					elWidth = element.width();
					elScrollWidth = element[0].scrollWidth;
					elOffsetX = element.position().left;
				}, arrowSpeed = 0;

			$($window).on('resize', $.debounce(250, updateMouseScrollValues));
			scope.$watch('sets', function () {
				whenPageIs.loaded.then(function () {
					updateMouseScrollValues();
				});
			});

			$($window).on('mousemove', $.throttle(5, function (e) {
				element.scrollLeft(
					(elScrollWidth - elWidth) *
					Math.min( Math.max((e.pageX - elOffsetX - scrollPadding) / (elWidth - (scrollPadding * 2)), 0), 1)
				);
			}));

			element.on('click.turnOnArrowAnimation', 'img', function () {
				$arrow.addClass('animate');
				$(this).off('click.turnOnArrowAnimation');
			});

			scope.$watch('selectedSet', function () {
				whenPageIs.loaded.then(function () {
					var $set = $('a[data-urlTitle="' + scope.selectedSet + '"]');

					if (!$set.length) return;

					$arrow.css({
						display: 'block',
						right: ($set.siblings().length - 1 - $set.index()) * $set.width()
					});
				});
			});

		}
	};
}]);
