angular.module('ahImageOptions', [])

.directive('ahImageOptions', ['$window', function ($window) {
	return {
		restrict: 'AE',
		templateUrl: 'directives/ah-image-options',
		scope: {
			photoId: '@'
		},
		link: function (scope, element) {
			element.on('click', function (e) {
				e.stopPropagation();
			});

			element.find('.sizeOption').on('mouseover', function () {
				element.find('.cartImg').hide();
				element.find('.price').html('$' + $(this).attr('data-price')).css('display', 'inline-block');
			}).on('mouseout', function () {
				element.find('.price').hide();
				element.find('.cartImg').show();
			}).on('click', function () {
				var $this = $(this),
					size = $this.html(),
					price = $this.attr('data-price');

				element.find('input[name=item_name]').val('Print - ' + size);
				element.find('input[name=amount]').val(price);
				element.find('input[name=submit]').trigger('click');
			});
		}
	};
}]);
