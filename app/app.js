angular.module('flickrPortfolioSite', [
	'ahFlickr',
	'ahSets',
	'ahPhoto',
	'ahPaypal',
	'ahImageOptions',
	'ahPromises',
	'ngRoute'
])

.config(['$routeProvider', 'ahFlickrProvider', 'ahPromisesProvider', function ($routeProvider, flickrProvider, promisesProvider) {
	flickrProvider.setApiKey(config.flickr.apiKey);

	$routeProvider
		.when('/:albumUrl/:photoId?', {
			templateUrl: 'views/gallery',
			controller: 'GalleryController',
			resolve: {
				sets: promisesProvider.resolve('sets')
			}
		});
}])

.controller('AppController', ['$scope', 'ahFlickr', 'ahPromises', '$routeParams', '$window',
	function ($scope, flickr, promises, $routeParams, $window) {

	$scope.$on('$routeChangeSuccess', function () {
		$scope.selectedSet = $routeParams.albumUrl;
	});

	flickr.user(config.flickr.userId).sets().then(function (sets) {
		$scope.sets = sets;

		if (!$window.location.hash) {
			$window.location.hash = '/' + sets[0].urlTitle;
		}

		promises.deffered('sets').resolve();
	});

}]);
