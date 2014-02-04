'use strict';

zr.controller('AuthController', ['$scope', 'realtime',
	function ($scope, realtime) {
		/**
		 * Requests authorization from the user. Redirects to the previous target
		 * or to create a new doc if no other action once complete.
		 */
		$scope.authorize = function () {
			realtime.requireAuth(false);
		};
}]);
