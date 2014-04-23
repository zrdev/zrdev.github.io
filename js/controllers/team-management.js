zr.controller('TeamManagementController', ['$scope', 'teamResources', function($scope, teamResources) {
	$scope.teams = teamResources.groups;
}]);
