zr.controller('TeamManagementController', ['$scope', 'teamResources', function($scope, teamResources) {
	$scope.teams = teamResources.groups;
	$scope.currentTeam = null;

	for(var i = $scope.teams.length; i--; ) {
		$scope.teams[i].description = JSON.parse($scope.teams[i].description);
	}

	$scope.setTeam = function(team) {
		$scope.currentTeam = team; 
	}
}]);
