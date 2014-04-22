'use strict';

zr.controller('NavbarController', ['$scope', 'realtime', 'drive', 'zrdb',
	function ($scope, realtime, drive, zrdb) {
		/**
		 * Requests authorization from the user. Redirects to the previous target
		 * or to create a new doc if no other action once complete.
		 */

		 $scope.activeTournaments = [];
		 zrdb.getAllResources('tournament').then(function(data) {
			var allTournaments = data.data.rows;
			var now = Date.now();
			for(var i = allTournaments.length; i--; ) {
				var t = allTournaments[i];
				if(t.tournamentEndDate > now) {
					$scope.activeTournaments.push(t);
				}
			}
		 });

		 drive.getUser(function(data) {
		 	$scope.$apply(function() {
		 		if(data) {
		 			$scope.displayName = data.displayName;
		 		}
		 		else {
		 			$scope.displayName = null;
		 		}
		 		$scope.showLogin = true;
		 	})
		 });
		
		$scope.newProject = function() {
			drive.newProject();
		};
		
		$scope.openProject = function() {
			drive.openProject();
		};

		$scope.signIn = function() {
			realtime.requireAuth();
		}
}]);
