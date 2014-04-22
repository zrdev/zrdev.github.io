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

		 var getUser = function() {
		 	realtime.requireAuth(true).then(function() {
				drive.getUser(function(data) {
				 	$scope.$apply(function() {
				 		if(data && data.displayName) {
				 			$scope.displayName = data.displayName;
				 		}
				 		else {
				 			$scope.displayName = null;
				 		}
				 		$scope.showLogin = true;
				 	})
				 });
		 	});
		 };
		 getUser();
		
		$scope.newProject = function() {
			drive.newProject();
		};
		
		$scope.openProject = function() {
			drive.openProject();
		};

		$scope.signIn = function() {
			realtime.requireAuth(false).then(getUser);
		}

		$scope.signOut = function() {
			window.location.href = 'https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=' + window.location.href;
		}
}]);
