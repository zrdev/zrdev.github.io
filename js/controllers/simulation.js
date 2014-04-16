zr.controller('SimulationController', function($scope, $modalInstance, gameResource) {
	var game = gameResource.data;
	$scope.data = {
		sph: 1,
		opponentId: null,
		timeout: game.defaultTimeout,
		sph1init: JSON.parse(game.initState1),
		sph2init: JSON.parse(game.initState2),
		gameVars: []
	};
	var varsConfig = JSON.parse(game.gameVariables);
	for(var i = varsConfig.length; i--; ) {
		$scope.data.gameVars.push({
			name: varsConfig[i].name,
			value: varsConfig[i].min
		});
	}

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
