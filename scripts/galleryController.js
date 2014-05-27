angular.module('flickrPortfolioSite')

.controller('GalleryController', ['$scope', '$routeParams', 'ahFlickr', '$window', '$route', '$timeout',
	function ($scope, $routeParams, flickr, $window, $route, $timeout) {

	var layout = function () {
			if (!$scope.photos) return;

			var mHeight = $scope.maxHeight,
				photos = $scope.photos,
				viewportWidth = $('.photos').outerWidth(),
				eolIndexes = [],
				heightMap = (function () {
					var map = [],
						layoutRow = function (startIndex) {
							var i = startIndex, j,
								space = viewportWidth - 10,
								rowWidth = 0, verticalSpace, lastRowHeight;

							while (i < photos.length && rowWidth < space) {
								rowWidth += (mHeight * photos[i].aspect);
								space -= 10;
								i++;
							}

							rowHeight = ((mHeight / rowWidth) * space);

							if (rowWidth < space) {
								if (eolIndexes.length) {
									rowHeight = mHeight;
								} else {
									verticalSpace = $($window).height() - headerHeight - 30;
									rowHeight = Math.min(verticalSpace, rowHeight);
								}
							}

							for (j = startIndex; j < i; j++) {
								map[j] = rowHeight;
							}

							if (i === photos.length) return;

							eolIndexes.push(i - 1);
							layoutRow(i);
						};

					layoutRow(0);
					return map;
				})();

			$scope.heightMap = heightMap;
			$scope.eolIndexes = eolIndexes;
			$scope.laidOut = true;
		},

		photoForId = function (photoId) {
			var r;
			angular.forEach($scope.photos, function (photo) {
				if (photo.data.id === photoId) {
					r = photo;
					return false;
				}
			});

			return r;
		},

		$loader = $('.loader'),
		positionLoader = function () {
			$loader.css({
				top: ($($window).height() / 2) - 50,
				left: ($($window).width() / 2) - 64
			});
		},

		updateOverlay = function () {
			if (!$scope.selectedPhoto) {
				$($window).off('mousemove.showImgOptions');
				return;
			}

			var photo = $scope.selectedPhoto,
				windowWidth = $($window).width(),
				windowHeight = $($window).height(),
				windowAspect = windowWidth / windowHeight,
				width = windowAspect < photo.aspect ? windowWidth : (windowHeight * photo.aspect),
				height = width / photo.aspect, intialOptionsHideTimer;

			$scope.overlay.width = width;
			$scope.overlay.height = height;
			$scope.overlay.marginTop = (windowHeight / 2) - (height / 2);
			$scope.overlay.url = photo.urlForWidth(windowWidth, 1.5);
			$scope.overlay.smallUrl = photo.urlForHeight($scope.maxHeight);

			// intialOptionsHideTimer = $timeout(function () {
				// $scope.overlay.showOptionsButton = false;
			// }, 4000);

			// $($window).on('mousemove.showImgOptions', $.debounce(250, true, function () {
				// $timeout.cancel(intialOptionsHideTimer);
				// $scope.$apply(function () {
					// $scope.overlay.showOptionsButton = true;
				// });
			// })).on('mousemove.showImgOptions', $.debounce(4000, false, function () {
				// $scope.$apply(function () {
					// $scope.overlay.showOptionsButton = false;
				// });
			// }));
		},

		headerHeight = $('header').height();

	$scope.maxHeight = 320;
	$scope.overlay = {};
	$scope.overlay.showOptionsButton = true;

	positionLoader();
	$('.gallery').height($($window).height() -  headerHeight);
	$($window).on('resize.positions', $.throttle(250, function () {
		positionLoader();
		$('.gallery').height($($window).height() -  headerHeight);
		$scope.$apply(function () {
			updateOverlay();
		});
	}));

	angular.forEach($scope.$parent.sets, function (set) {
		if (set.urlTitle === $routeParams.albumUrl) {
			$scope.set = set;
		}
	});

	if (!$scope.set) {
		$window.location.hash = '/' + $scope.$parent.sets[0].urlTitle;
		return;
	}

	$scope.set.photos().then(function (photos) {
		$scope.photos = photos;
		$scope.selectedPhoto = photoForId($routeParams.photoId);
		updateOverlay();

		layout();
		$($window).on('resize.layoutGallery', $.throttle(250, function () {
			$scope.$apply(function () {
				layout();
			});
		}));
	});

	$scope.$on('$locationChangeSuccess', (function () {
		var currentRoute = $route.current;

		return function (event) {
			if (currentRoute.params.albumUrl === $route.current.params.albumUrl) {
				$routeParams = currentRoute.params = $route.current.params;
				$route.current = currentRoute;
				$scope.selectedPhoto = photoForId($routeParams.photoId);
				updateOverlay();
			}
		};
	})());

	$('.overlay').on('click', function () {
		$window.location.hash = '/' + $routeParams.albumUrl;
	}).find('.imgOptions').on('click', function (e) {
		e.stopPropagation();
	});

	$(document).on('keydown', function (e) {
		if (e.which === 27) {
			$window.location.hash = '/' + $routeParams.albumUrl;
		}
	});

	$scope.$watch('selectedPhoto', function () {
		if (!$scope.selectedPhoto) {
			if ($scope.overlay) {
				$scope.overlay.url = '';
				$scope.overlay.optionsActive = false;
			}
		}
	});

}]);
