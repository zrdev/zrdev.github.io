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
		});

		//Load the Drive APIs - this should be lazy loaded in the future
		gapi.load('client:drive-share:drive-realtime', function () {
			// Monkey patch collaborative string for ng-model compatibility
			Object.defineProperty(gapi.drive.realtime.CollaborativeString.prototype, 'text', {
				set: gapi.drive.realtime.CollaborativeString.prototype.setText,
				get: gapi.drive.realtime.CollaborativeString.prototype.getText
			});
			
			//This code copied from blockly/core/realtime.js; register Blockly custom types
			var custom = gapi.drive.realtime.custom;
			custom.registerType(Blockly.Block, 'Block');
			Blockly.Block.prototype.id = custom.collaborativeField('id');
			Blockly.Block.prototype.xmlDom = custom.collaborativeField('xmlDom');
			Blockly.Block.prototype.relativeX = custom.collaborativeField('relativeX');
			Blockly.Block.prototype.relativeY = custom.collaborativeField('relativeY');
			custom.setInitializer(Blockly.Block, Blockly.Block.prototype.initialize);
			gapi.client.setApiKey(config.simpleApiKey);
		});
}]);
