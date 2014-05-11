zr.controller('SimulationController', ['$scope', '$modalInstance', 'gameResource', 'drive', 'realtime', function($scope, $modalInstance, gameResource, drive, realtime) {
	var game = gameResource.data;

	$scope.resetAll = function() {
		$scope.data = {
			sph: 1,
			opponentId: null,
			timeout: game.defaultTimeout,
			sph1init: JSON.parse(game.initState1),
			sph2init: JSON.parse(game.initState2),
			gameVars: JSON.parse(game.gameVariables),
			opponentCode: 'void init() {} void loop() {}'
		};
		for(var i = $scope.data.gameVars.length; i--; ) {
			$scope.data.gameVars[i].value = $scope.data.gameVars[i].min;
		}
	}
	$scope.resetAll();

	$scope.opponentTitle = 'No Opponent';
	
	$scope.simulate = function() {
		for(var i = $scope.data.gameVars.length; i--; ) {
			var v = $scope.data.gameVars[i];
			delete v.min;
			delete v.max;
			delete v.type;
		}
		$modalInstance.close($scope.data);
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	$scope.randomize = function() {
		for(var i = $scope.data.gameVars.length; i--; ) {
			var v = $scope.data.gameVars[i];
			if(v.type === 'int') {
				v.value = v.min + Math.floor(Math.random() * (v.max - v.min + 1));
			}
			else if(v.type === 'float') {
				v.value = v.min + Math.random() * (v.max - v.min);
			}
		}
	};

	$scope.pickOpponent = function() {
		drive.openProject(function(id, name) {
			realtime.getDocument(id, true).then(function(doc) {
				$scope.opponentTitle = name;
				$scope.data.opponentCode = realtime.getDocAsString(doc.getModel().getRoot());
			});
		});
	}
}]);
