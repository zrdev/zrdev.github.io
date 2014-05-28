zr.controller('SharingModalController', ['$scope', '$modalInstance', 'teamResources', function($scope, $modalInstance, teamResources) {
	var game = gameResource.data;
	
	$scope.share = function() {
		for(var i = $scope.data.gameVars.length; i--; ) {
			var v = $scope.data.gameVars[i];
			delete v.min;
			delete v.max;
			delete v.type;
		}
		$modalInstance.close($scope.data);
	};

	$scope.unshare = function() {
		
	}
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};


}]);
