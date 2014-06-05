zr.controller('ApplicationController', ['$scope', '$route', 'tournamentResource', function($scope, $route, tournamentResource) {
	$scope.tournament = tournamentResource.data;
}]);
