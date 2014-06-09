zr.controller('ApplicationController', ['$scope', 'drive', 'tournamentResource', 'teamResources', 'zrdb', '$location', function($scope, drive, tournamentResource, teamResources, zrdb, $location) {
	$scope.countries = ['United States', 'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece', 'Ireland', 'Italy', 'Luxembourg', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'];
	$scope.states = ['', "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "FM", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"];
	$scope.tournament = tournamentResource.data;
	$scope.teams = teamResources.data.rows;

	$scope.data = {
		team: {
			state: '',
			country: ''
		}, 
		mentors: {},
		essays: {},
		isReturning: null
	}
	$scope.agreement = [false, false, false, false, false, false];

	drive.getUser(function(data) {
		if(typeof data === 'object') {
			$scope.data.mentors.email = data.emails[0].value;
			$scope.data.mentors.name = data.name.givenName + ' ' + data.name.familyName;
		}
	});

	$scope.submit = function() {
		//Validation
		for(var i = $scope.agreement.length; i--; ) {
			if(!$scope.agreement[i]) {
				alert('You must agree to all the team commitments before submitting your application.');
				return;
			}
		}
		if(!$scope.data.team.name ||
			!$scope.data.team.school ||
			!$scope.data.team.city ||
			!$scope.data.team.country ||
			!$scope.data.mentors.name ||
			!$scope.data.mentors.email ||
			!$scope.data.mentors.profession ||
			!$scope.data.mentors.howHeard ||
			!$scope.data.essays.teamSkills ||
			!$scope.data.essays.teamOrganization ||
			!$scope.data.essays.programming ||
			!$scope.data.essays.spheres ||
			$scope.data.isReturning === null) {
			alert('Please fill in all fields not labeled as optional.')
			return;
		}
		if($scope.data.team.country === 'United States' && !$scope.data.team.state) {
			alert('Teams from the United States must specify the state where their team is located.');
			return;
		}
		if($scope.data.team.country !== 'United States' && $scope.data.team.state) {
			alert('Teams not from the United States should leave the State field blank.');
			return;
		}

		delete $scope.data.team.tournamentsTeammembershipCollection;
		delete $scope.data.team.tournamentsRankCollection;
		zrdb.addResource('application', {
			date: new Date().getTime(),
			status: 'PENDING',
			data: JSON.stringify($scope.data),
			email: $scope.data.mentors.email,
			tournamentId: $scope.tournament.id
		}, function() {
			alert('Application successfully submitted. You will be notified by email when we have processed it.')
			$location.path('/');
		});

	}
}]);
