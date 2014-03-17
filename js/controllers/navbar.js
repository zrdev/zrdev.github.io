'use strict';

zr.controller('NavbarController', ['$scope', 'realtime', 'drive',
	function ($scope, realtime, drive) {
		/**
		 * Requests authorization from the user. Redirects to the previous target
		 * or to create a new doc if no other action once complete.
		 */
		$scope.authorize = function () {
			realtime.requireAuth(false);
		};
		
		$scope.newProject = function() {
			drive.openProject();
		};
		
		$scope.openProject = function() {
			drive.openProject();
		};
}]);
