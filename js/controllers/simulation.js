zr.controller('SimulationController', function($scope, $modalInstance) {
	$scope.data = {
		sph: 1
	};
	
	$modalInstance.opened.then(function() {
	});
	
	$scope.createProject = function() {
		$modalInstance.close();
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});
