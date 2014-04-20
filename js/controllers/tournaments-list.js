zr.controller('TournamentsListController', ['$scope', 'tournamentResources', function($scope, tournamentResources) {
	$scope.pastTournaments = [];
	$scope.activeTournaments = [];
	var allTournaments = tournamentResources.data.rows;
	var now = Date.now();
	for(var i = allTournaments.length; i--; ) {
		var t = allTournaments[i];
		if(t.tournamentEndDate < now) {
			$scope.pastTournaments.push(t);
		}
		else {
			$scope.activeTournaments.push(t);
		}
	}
}]);
