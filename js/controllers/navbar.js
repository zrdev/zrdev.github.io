'use strict';

zr.controller('NavbarController', ['$scope', 'realtime', 'drive', 'zrdb', '$location', '$timeout', 'config',
	function ($scope, realtime, drive, zrdb, $location, $timeout, config) {
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
		 };
		
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

		window.loginCallback = function(authResult) {
			if(authResult['status']['signed_in']) {
				getUser();
			}
			else if(authResult['error'] === 'user_signed_out') {
				$scope.displayName = null;
			}
			$scope.showLogin = true;
		};

		$scope.signOut = function() {
			gapi.auth.signOut();
		}

		//Render the login button
		gapi.signin.render('login-button', {
			'width': 'wide'
		})
}]);
