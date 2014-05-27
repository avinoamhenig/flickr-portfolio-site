angular.module('ahPhoto', [])

.directive('ahPhoto', ['$window', function ($window) {
	return {
		restrict: 'AE',
		templateUrl: 'directives/ah-photo',
		scope: {
			img: '@',
			imgHeight: '@',
			eol: '@',
			ready: '@',
			photo: '='
		},
		link: function (scope, element) {
			element.find('img').on('load', function () {
				scope.$apply(function () {
					scope.loaded = true;
				});
			}).on('click', function () {
				$window.location.hash += '/' + scope.photo.data.id;
			});
		}
	};
}]);
