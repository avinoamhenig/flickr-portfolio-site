angular.module('whenPageIs', []).factory('whenPageIs', ['$window', '$document', '$q', function ($window, $document, $q) {
	return {
		ready: (function () {
			var deffered = $q.defer();
			$document.ready(function() {
				deffered.resolve();
			});
			return deffered.promise;
		})(),
		loaded: (function () {
			var deffered = $q.defer();
			$($window).on('load', function() {
				deffered.resolve();
			});
			return deffered.promise;
		})()
	};
}]);
