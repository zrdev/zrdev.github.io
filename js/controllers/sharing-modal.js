zr.controller('SharingModalController', ['$scope', '$modalInstance', 'teamResources', 'realtime', function($scope, $modalInstance, teamResources, realtime) {
	$scope.teams = teamResources.data.rows;

	$scope.share = function(team) {
		var ms = team.tournamentsTeammembershipCollection;
		var httpBatch = gapi.client.newHttpBatch();
		for(var i = ms.length; i--; ) {
			httpBatch.add(gapi.client.request({
				'path': '/drive/v2/files/' + realtime.id + '/permissions',
				'method': 'POST',
				'params': {
					'sendNotificationEmails': true
				},
				'body': JSON.stringify({
					'value': ms[i].email,
					'role': 'writer',
					'type': 'user'
				})
			}));
		}
		httpBatch.execute();
	}

	$scope.unshare = function(team) {
		var ms = team.tournamentsTeammembershipCollection;
		var emails = [];
		for(var i = ms.length; i--; ) {
			emails.push(ms[i].email);
		}
		gapi.client.request({
			'path': '/drive/v2/files/' + realtime.id + '/permissions',
			'method': 'GET'
		}).execute(function(data) {
			var httpBatch = gapi.client.newHttpBatch();
			for(var i = data.items.length; i--; ) {
				if(data.items[i].role !== 'owner' && emails.indexOf(data.items[i].emailAddress) !== -1) {
					httpBatch.add(gapi.client.request({
						'path': '/drive/v2/files/' + realtime.id + '/permissions/' + data.items[i].id,
						'method': 'DELETE'
					}));
				}
			}
			httpBatch.execute();
		});
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

}]);
