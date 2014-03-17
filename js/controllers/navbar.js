'use strict';

zr.controller('NavbarController', ['$scope', '$modal', 'realtime', '$location', 'config',
	function ($scope, $modal, realtime, $location, config) {
		/**
		 * Requests authorization from the user. Redirects to the previous target
		 * or to create a new doc if no other action once complete.
		 */
		$scope.authorize = function () {
			realtime.requireAuth(false);
		};
		
		$scope.newProject = function() {
			$modal.open({
				templateUrl: '/partials/new-project-modal.html',
				controller: 'NewProjectModalController'
			});
		};
		
		$scope.openProject = function() {
			realtime.requireAuth().then(function () {
				var pickerCallback = function(data) {
					if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
						var doc = data[google.picker.Response.DOCUMENTS][0];
						var id = doc[google.picker.Document.ID];
						$scope.$apply(function() {
							$location.url('/ide/' + id + '/');
						});
					}
				};
				gapi.load('picker', {"callback" : function() {
					var picker = new google.picker.PickerBuilder().
						enableFeature(google.picker.Feature.NAV_HIDDEN).
						hideTitleBar().
						setAppId(config.appId).
						setOAuthToken(gapi.auth.getToken().access_token).
						addView(new google.picker.DocsView().
							setParent('root').
							setIncludeFolders(true).
							setMimeTypes('application/vnd.google-apps.drive-sdk.' + config.appId)).
						setCallback(pickerCallback).
						build();
					picker.setVisible(true);
				}});
			});
		};
}]);
