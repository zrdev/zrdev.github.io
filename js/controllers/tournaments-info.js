zr.controller('TournamentsInfoController', ['$scope', '$route', 'tournamentResource', function($scope, $route, tournamentResource) {
	$scope.tournament = tournamentResource.data;
	$scope.resource = null;
	//Resolve URL params to state
	if($route.current.params.mode !== void 0) {
		$scope.mode = $route.current.params.mode;
	}
	else {
		$scope.mode = 'info';
	}
	if($route.current.params.resourceId !== void 0) {
		$scope.resourceId = parseInt($route.current.params.resourceId);
		var list;
		if($scope.mode === 'info') {
			list = $scope.tournament.tournamentsInfopageCollection;
		}
		else if($scope.mode === 'teams') {
			list = $scope.tournament.tournamentsDivisionCollection;
		}
		else if($scope.mode === 'scores') {
			list = $scope.tournament.tournamentsCompetitionCollection;
		}
		else {
			list = [];
		}
		for(var i = list.length; i--; ) {
			if(list[i].id === $scope.resourceId) {
				$scope.resource = list[i];
				break;
			}
		}
	}
	else { //Root page: display overview
		for(var i = $scope.tournament.tournamentsInfopageCollection.length; i--; ) {
			var p = $scope.tournament.tournamentsInfopageCollection[i];
			if(p.displayOrder === 1) {
				$scope.resource = p;
				$scope.resourceId = p.id;
				break;
			}
		}
	}
}]);
