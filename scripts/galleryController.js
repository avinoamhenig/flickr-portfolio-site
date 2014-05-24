angular.module('flickrPortfolioSite')

.controller('GalleryController', ['$scope', '$routeParams', 'ahFlickr', '$window', '$route', '$timeout',
	function ($scope, $routeParams, flickr, $window, $route, $timeout) {

	var layout = function (mHeight) {
			if (!$scope.photos) return;
			if (typeof mHeight !== 'number') mHeight = $scope.maxHeight;

			var photos = $scope.photos,
				windowWidth = $($window).width(),
				eolIndexes = [],
				heightMap = (function () {
					var map = [],
						layoutRow = function (startIndex) {
							var i = startIndex, j,
								rowWidth = 6;

							do {
								if (i === photos.length) break;

								rowWidth += (mHeight * photos[i].aspect) + 10;
								i++;
							} while (rowWidth < windowWidth);

							if (rowWidth < windowWidth) {
								for (j = startIndex; j < i; j++)
									map[j] = mHeight;
							} else {
								for (j = startIndex; j < i; j++)
									map[j] = (mHeight / rowWidth) * windowWidth;
							}

							if (i === photos.length) return;

							eolIndexes.push(i - 1);
							layoutRow(i);
						};

					layoutRow(0);
					return map;
				})();

			if ((!eolIndexes.length || eolIndexes.length === photos.length - 1) && mHeight == $scope.maxHeight) {
				var rowAspect = 0;
				$.each(photos, function (i, photo) {
					rowAspect += photo.aspect;
				});


				return layout(
					Math.min(
						$($window).height() - 114,
						Math.max(
							($($window).height() - 114) / Math.max(1, photos.length - 0.25),
							$($window).width() / rowAspect)));
			}

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
				height = width / photo.aspect,
				url = photo.urlForWidth(windowWidth, 1.5),
				marginTop = (windowHeight / 2) - (height / 2);

			$scope.overlay = {
				width: width,
				height: height,
				marginTop: marginTop,
				url: url,
				showOptions: false
			};

			$timeout(function () {
				$('body').css('overflow', 'hidden');
			}, 700);

			$($window).on('mousemove.showImgOptions', $.debounce(250, true, function () {
				$scope.$apply(function () {
					$scope.overlay.showOptions = true;
				});
			})).on('mousemove.showImgOptions', $.debounce(3000, false, function () {
				$scope.$apply(function () {
					$scope.overlay.showOptions = false;
				});
			}));
		};

	positionLoader();
	$($window).on('resize.positions', $.throttle(250, function () {
		positionLoader();
		$scope.$apply(function () {
			updateOverlay();
		});
	}));

	$scope.maxHeight = 320;

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
	}).find('.imgContainer').on('click', function (e) {
		e.stopPropagation();
	});

}]);
