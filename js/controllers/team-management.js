zr.controller('TeamManagementController', ['$scope', 'teamResources', 'zrdb', function($scope, teamResources, zrdb) {
	$scope.teams = teamResources.data.rows;
	$scope.currentTeam = null;
	$scope.isLead = true;
	$scope.newmem = {
		email: ''
	};
	$scope.countries = ['United States', 'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece', 'Ireland', 'Italy', 'Luxembourg', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'];
	$scope.states = ["", "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "FM", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];

	var httpBatch = gapi.client.newHttpBatch();
	for(var i = $scope.teams.length; i--; ) {
		var ts = $scope.teams[i].tournamentsTeammembershipCollection;
		for(var j = ts.length; j--; ) {
			httpBatch.add(gapi.client.request({
				'path': '/plus/v1/people/' + ts[j].id,
				'method': 'GET'
			}), {
				callback: function(data) {
					ts[j].email = data.emails[0].value;
					ts[j].name = data.displayName;
				}
			});
		};
	};
	httpBatch.execute();

	$scope.setTeam = function(team) {
		$scope.currentTeam = team;
	};
	if($scope.teams && $scope.teams.length !== 0) {
		$scope.setTeam($scope.teams[0]);
	}
	
	var ms = $scope.currentTeam.tournamentsTeammembershipCollection; //Short name!

	//For editing the basic team info
	$scope.setData = function() {
		zrdb.putResource('team', $scope.currentTeam.id, $scope.currentTeam);
	};
	$scope.deleteMember = function(m) {
		zrdb.deleteResource('teammembership', m.id, function() {
			var index = ms.indexOf(m);
			ms.splice(index, 1);
		});
	}
	$scope.addMember = function() {
		var resource = {
			'inviteAccepted': false,
			'isLead': false,
			'teamId': $scope.currentTeam.id,
			'email': $scope.newmem.email,
			'tournamentId': 17 //TODO: Separate rosters for different tournaments
		};
		zrdb.addResource('teammembership', resource, function() {
			zrdb.getSingleResource('team', $scope.currentTeam.id, true).then(function(data) {
				$scope.currentTeam.tournamentsTeammembershipCollection = data.data.tournamentsTeammembershipCollection;
			})
		});
		$scope.newEmail = '';
	}
}]);
