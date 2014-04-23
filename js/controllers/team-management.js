zr.controller('TeamManagementController', ['$scope', 'teamResources', 'realtime', function($scope, teamResources, realtime) {
	$scope.teams = teamResources.groups;
	$scope.currentTeam = null;
	$scope.countries = ['United States', 'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece', 'Ireland', 'Italy', 'Luxembourg', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'];
	$scope.states = ['', "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY"];

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
				$scope.$apply(function() {
					$scope.currentTeam.members = response.members;
				});
			});
		});
	};

	$scope.setData = function() {
		gapi.client.request({
			'path': '/admin/directory/v1/groups/' + $scope.currentTeam.id,
			'method': 'PUT',
			'params': {
				'fields': ''
			},
			'body': JSON.stringify({
				'description': JSON.stringify($scope.currentTeam.description)
			})
		})
		.execute(function() {});
	};
}]);
