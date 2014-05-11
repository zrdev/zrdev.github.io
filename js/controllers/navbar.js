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

		 $scope.getUser = function() {
			drive.getUser(function(data) {
				$timeout(function() {
			 		if(data && data.displayName) {
			 			$scope.displayName = data.displayName;
			 			$scope.showLogin = true;
			 		}
			 		else {
			 			$scope.displayName = null;
			 		}
				});
			 });
		 };
		 $scope.getUser();
		
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

		//Render the login button
		gapi.signin.render('login-button', {
			'width': 'wide',
		});
		gapi.client.setApiKey(config.simpleApiKey);
		//Give global reference for login callback
		zr.navbarScope = $scope;
}]);
