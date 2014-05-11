'use strict';

zr.controller('NavbarController', ['$scope', 'drive', 'zrdb', '$location', '$timeout', 'config',
	function ($scope, drive, zrdb, $location, $timeout, config) {
		gapi.client.setApiKey(config.simpleApiKey);

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

		 var firstTime = true;
		 $scope.getUser = function() {
			drive.getUser(function(data) {
				$timeout(function() {
			 		if(data && data.displayName) {
			 			$scope.displayName = data.displayName;
			 		}
			 		else {
			 			$scope.displayName = null;
			 			if(firstTime) {
							//Render the login button
							gapi.signin.render('login-button', {
								'width': 'wide'
							});
							firstTime = false;
			 			}
			 		}
			 		$scope.showLogin = true;
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
			$location.path('/');
		}

		//Give global reference for login callback
		zr.navbarScope = $scope;
}]);
