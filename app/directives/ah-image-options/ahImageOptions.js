angular.module('ahImageOptions', [])

.directive('ahImageOptions', ['$window', function ($window) {
	return {
		restrict: 'AE',
		templateUrl: 'directives/ah-image-options',
		scope: {
			showButton: '=',
			photo: '=',
			active: '='
		},
		link: function (scope, element) {
			scope.user = $window.config.paypal.user;
		}
	};
}]);
