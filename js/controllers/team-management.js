zr.controller('TeamManagementController', ['$scope', 'teamResources', 'zrdb', 'drive', '$location', function($scope, teamResources, zrdb, drive, $location) {
	$scope.teams = teamResources.data.rows;
	$scope.currentTeam = null;
	$scope.isLead = false;
	$scope.newmem = {
		email: ''
	};
	$scope.countries = ['United States', 'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece', 'Ireland', 'Italy', 'Luxembourg', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'];
	$scope.states = ["", "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "FM", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];

	// Not needed since we are using emails as the primary key now
	// Get user data for members
	// var httpBatch = gapi.client.newHttpBatch();
	// for(var i = $scope.teams.length; i--; ) {
	// 	var ts = $scope.teams[i].tournamentsTeammembershipCollection;
	// 	for(var j = ts.length; j--; ) {
	// 		var user = ts[j];
	// 		httpBatch.add(gapi.client.request({
	// 			'path': '/plus/v1/people/' + user.userId,
	// 			'method': 'GET'
	// 		}), {
	// 			callback: function(data) {
	// 				user.email = data.result.emails[0].value;
	// 				user.name = data.result.displayName;
	// 			}
	// 		});
	// 	};
	// };
	// httpBatch.execute();


	$scope.setTeam = function(team) {
		$scope.currentTeam = team;
		var ms = team.tournamentsTeammembershipCollection;
		for(var i = ms.length; i--; ) {
			if(ms[i].email === myEmail) {
				$scope.isLead = ms[i].isLead;
				break;
			}
		}
	};

	var myEmail = '';
	drive.getUser(function(data) {
		if(data && data.emails) {
			myEmail = data.emails[0].value;
		}
		if($scope.teams && $scope.teams.length !== 0) {
			$scope.setTeam($scope.teams[0]);
		}
	});


	//For editing the basic team info
	$scope.setData = function() {
		zrdb.putResource('team', $scope.currentTeam.id, $scope.currentTeam);
	};

	$scope.deleteMember = function(m) {
		var ms = $scope.currentTeam.tournamentsTeammembershipCollection;
		zrdb.deleteResource('teammembership', m.id, function() {
			var index = ms.indexOf(m);
			ms.splice(index, 1);
		});
	}

	$scope.deleteMe = function() {
		if(confirm('Are you sure you want to remove yourself from this team?')) {
			var ms = $scope.currentTeam.tournamentsTeammembershipCollection;
			for(var i = ms.length; i--; ) {
				if(ms[i].email.toLowerCase() === myEmail.toLowerCase()) {
					zrdb.deleteResource('teammembership', ms[i].id, function() {
						var index = $scope.teams.indexOf($scope.currentTeam);
						$scope.teams.splice(index, 1);
						if($scope.teams.length) {
							$scope.setTeam($scope.teams[0]);
						}
						else {
							$location.path('/');
						}
					});
					break;
				}
			}
		}
	};

	$scope.addMember = function() {
		var resource = {
			'isLead': false,
			'teamId': $scope.currentTeam.id,
			'email': $scope.newmem.email
		};
		zrdb.addResource('teammembership', resource, function() {
			zrdb.getSingleResource('team', $scope.currentTeam.id, true).then(function(data) {
				$scope.currentTeam.tournamentsTeammembershipCollection = data.data.tournamentsTeammembershipCollection;
			})
		});
		$scope.newEmail = '';
	}
}]);
