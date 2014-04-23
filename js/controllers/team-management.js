zr.controller('TeamManagementController', ['$scope', 'teamResources', 'realtime', function($scope, teamResources, realtime) {
	$scope.teams = teamResources.groups;
	$scope.currentTeam = null;

	for(var i = $scope.teams.length; i--; ) {
		$scope.teams[i].description = JSON.parse($scope.teams[i].description);
		$scope.teams[i].members = [];
	}

	$scope.setTeam = function(team) {
		$scope.currentTeam = team; 
		realtime.requireAuth().then(function() {
			gapi.client.request({
				'path': '/admin/directory/v1/groups/' + team.id + '/members',
				'method': 'GET'
			})
			.execute(function(response){
				$scope.currentTeam.members = response.members;
			});
		});
	}
}]);
