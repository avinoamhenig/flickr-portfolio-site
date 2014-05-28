angular.module('ahPromises', []).provider('ahPromises', function AHPromisesProvider() {
	this.resolve = function (id) {
		return ['ahPromises', function (promises) {
			return promises.promise(id);
		}];
	};

	this.$get = ['$q', function ($q) {
		var deffereds = {},

			deffered = function(id) {
				if (!deffereds[id]) {
					deffereds[id] = $q.defer();
				}

				return deffereds[id];
			},

			promise = function (id) {
				return this.deffered(id).promise;
			};

		return {
			deffered: deffered,
			promise: promise
		};
	}];
});
