angular.module('ahPhoto', [])

.directive('ahPhoto', ['$window', function ($window) {
	return {
		restrict: 'AE',
		templateUrl: 'directives/ah-photo',
		scope: {
			img: '@',
			height: '@',
			eol: '@',
			ready: '@',
			photoId: '@'
		},
		link: function (scope, element) {
			element.find('img').on('load', function () {
				scope.$apply(function () {
					scope.loaded = true;
				});
			}).on('click', function () {
				$window.location.hash += '/' + scope.photoId;
			});
		}
	};
}]);
