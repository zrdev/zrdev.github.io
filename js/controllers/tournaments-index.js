zr.controller('TournamentsListController', function($scope) {
	$scope.data = {};
	$scope.data.activeTournaments = [
		{
			id: 1,
			name: 'Some Tournament',
			logo: 'images/logo.png',
			description: 'Awesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tournament yayAwesome tourna',
			registrationStartDate: 1391067721757,
			registrationEndDate: 1391067721757,
			tournamentEndDate: 1391067721758
		},
		{
			id: 2,
			name: 'Some Other Tournament',
			logo: 'images/logo.png',
			description: 'Better tournament yay',
			registrationStartDate: 1391067721757,
			registrationEndDate: 1391067721757,
			tournamentEndDate: 1391067721757
		}
	];
	$scope.data.pastTournaments = [
		{
			id: 3,
			name: 'Old',
			logo: 'images/logo.png',
			description: 'Awesome tournament yay',
			registrationStartDate: 1391067721757,
			registrationEndDate: 1391067721757,
			tournamentEndDate: 1391067721756
		},
		{
			id: 4,
			name: 'Older',
			logo: 'images/logo.png',
			description: 'Better tournament yay',
			registrationStartDate: 1391067721757,
			registrationEndDate: 1391067721757,
			tournamentEndDate: 1391067721757
		}
	];
});
