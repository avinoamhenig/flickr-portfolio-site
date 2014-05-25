angular.module('ahImageOptions', [])

.directive('ahImageOptions', ['$window', function ($window) {
	return {
		restrict: 'AE',
		templateUrl: 'directives/ah-image-options',
		scope: {
			photo: '='
		},
		link: function (scope, element) {
			element.on('click', function (e) {
				e.stopPropagation();
			});

			element.find('.sizeOption').on('mouseover', function () {
				var $this = $(this);
				scope.$apply(function () {
					scope.showPrice = true;
					scope.price = $this.attr('data-price');
					scope.size = $this.html();
				});
			}).on('mouseout', function () {
				scope.$apply(function () {
					scope.showPrice = false;
				});
			}).on('click', function () {
				element.find('input[name=submit]').trigger('click');
			});
		}
	};
}]);
