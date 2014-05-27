angular.module('ahPaypal', [])

.directive('ahPaypal', [function () {
	return {
		restrict: 'AE',
		templateUrl: 'directives/ah-paypal',
		scope: {
			user: '=',
			name: '@',
			price: '@',
			text: '@',
			options: '='
		},
		link: function (scope, element) {
			scope.submit = function () {
				element.find('input[type=submit]').trigger('click');
			};
		}
	};
}]);
