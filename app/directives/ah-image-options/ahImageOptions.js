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
			var $sizeOptions = element.find('.sizeOptions'),
				$sizesDrop = element.find('.sizesDrop');

			scope.user = $window.config.paypal.user;
			scope.sizes = [];

			angular.forEach($window.config.sizeOptions, function (price, size) {
				scope.sizes.push({size: size, price:price});
			});

			scope.selectedSize = scope.sizes[0];

			scope.selectSize = function (size, price) {
				scope.selectedSize = size;
				$sizeOptions.removeClass('active');
			};

			$sizesDrop.find('.sizeVal').on('mouseenter', function () {
				$sizeOptions.addClass('active');
			});
		}
	};
}]);
