zr.controller('TeamManagementController', ['$scope', 'teamResources', function($scope, teamResources) {
	$scope.teams = teamResources.data.rows;
	$scope.currentTeam = null;
	$scope.isLead = false;
	$scope.countries = ['United States', 'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece', 'Ireland', 'Italy', 'Luxembourg', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'];
	$scope.states = ["", "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "FM", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];

	$scope.setTeam = function(team) {
		$scope.currentTeam = team;
	};
	if($scope.teams && $scope.teams.length !== 0) {
		$scope.setTeam($scope.teams[0]);
	}
	

	//For editing the basic team info
	$scope.setData = function() {
		gapi.client.request({
			'path': '/admin/directory/v1/groups/' + $scope.currentTeam.id,
			'method': 'PUT',
			'params': {
				'fields': ''
			},
			'body': {
				'description': JSON.stringify($scope.currentTeam.description)
			}
		})
		.execute(function() {});
	};
}]);
