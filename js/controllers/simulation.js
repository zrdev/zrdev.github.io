zr.controller('SimulationController', function($scope, $modalInstance) {
	$scope.data = {
		sph: 1,
		opponentId: null,
		timeout: 210,
		sph1init: [0.2, -0.65, 0.0, 0, 1, 0],
		sph2init: [-0.2, -0.65, 0.0, 0, 1, 0],
		gameVars: [
			{
				name: 'cometConfig',
				value: 0
			},
			{
				name: 'debrisConfig',
				value: 1
			}
		]
	};
	$scope.opponentTitle = 'No Opponent';
	
	$modalInstance.opened.then(function() {
	});
	
	$scope.simulate = function() {
		$modalInstance.close($scope.data);
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});
