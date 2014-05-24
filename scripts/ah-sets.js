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
			var elWidth, elOffsetX, elScrollWidth, scrollPadding = 100,
				updateMouseScrollValues = function () {
					elWidth = element.outerWidth();
					elScrollWidth = element[0].scrollWidth;
					elOffsetX = element.offset().left;
				}, arrowSpeed = 0;

			$($window).on('resize', $.debounce(250, updateMouseScrollValues));
			scope.$watch('sets', function () {
				whenPageIs.loaded.then(function () {
					updateMouseScrollValues();
				});
			});

			element.on('mousemove', $.throttle(5, function (e) {
				element.scrollLeft(
					(elScrollWidth - elWidth) *
					Math.min(
						Math.max((e.pageX - elOffsetX - scrollPadding) / (elWidth - (scrollPadding * 3)), 0),
						1)
				);
			})).on('click', 'img', function () {
				arrowSpeed = 200;
			});

			scope.$watch('selectedSet', function () {
				whenPageIs.loaded.then(function () {
					var $arrow = $('.arrow'),
						$set = $('a[data-urlTitle="' + scope.selectedSet + '"]');

					if (!$set.length) return;

					$arrow.css('display', 'inline-block').animate({
						right: elScrollWidth - $set.position().left - element.scrollLeft() - $arrow.width()
					}, arrowSpeed);
				});
			});

		}
	};
}]);
