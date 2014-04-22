zr.controller('TournamentsInfoController', ['$scope', '$route', 'tournamentResource', function($scope, $route, tournamentResource) {
	$scope.tournament = tournamentResource.data;
	
	//Resolve URL params to state
	if($route.current.params.mode !== void 0) {
		$scope.mode = $route.current.params.mode;
	}
	else {
		$scope.mode = 'info';
	}
	if($route.current.params.resourceId !== void 0) {
		$scope.resourceId = parseInt($route.current.params.resourceId);
	}

	$scope.setDisplay = function(mode, resourceId) {
		$scope.mode = mode;
		$scope.resourceId = resourceId;
	}
	
	$scope.getInfoPage = function() {
		var len = $scope.tournament.tournamentsInfopageCollection.length;
		for(var i = 0; i < len; i++) {
			if($scope.tournament.tournamentsInfopageCollection[i].id === $scope.resourceId) {
				return $scope.tournament.tournamentsInfopageCollection[i].content;
			}
		}
		return '';
	}
}]);
