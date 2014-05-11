'use strict';

zr.controller('NavbarController', ['$scope', 'drive', 'zrdb', '$location', '$timeout', 'config',
	function ($scope, drive, zrdb, $location, $timeout, config) {
		/**
		 * Requests authorization from the user. Redirects to the previous target
		 * or to create a new doc if no other action once complete.
		 */

		 $scope.clientId = config.appId;
		 $scope.scopes = config.scopes;

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
			drive.getUser(function(data) {
		 		if(data && data.displayName) {
		 			$scope.displayName = data.displayName;
		 		}
		 		else {
		 			$scope.displayName = null;
		 		}
		 		$scope.showLogin = true;
			 });
		 };
		 getUser();
		
		$scope.newProject = function() {
			drive.newProject();
		};
		
		$scope.openProject = function() {
			drive.openProject(function(id, name) {
				$timeout(function() {
					$location.url('/ide/' + id + '/');
				});
			});
		};



		$scope.signOut = function() {
			gapi.auth.signOut();
		}

		gapi.client.setApiKey(config.simpleApiKey);
		//Give global reference for login callback
		zr.navbarScope = $scope;
}]);
