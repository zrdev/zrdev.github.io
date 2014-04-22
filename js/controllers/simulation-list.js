zr.controller('SimulationListController', ['$scope', function($scope) {
	$scope.sims = [{
		id: 1,
		gameId: 24,
		code1: "void init() {} void loop() {}",
		status: "",
		message: "some message",
		code2: "void init() { int x = 0; } void loop() {}",
		snapshot1: 94857,
		snapshot2: 203458,
		sph1Result: 0,
		sph2Result: 0,
		simData: null,
		simConfig: "{"timeout": 240, "state1": [F@1dc80063, "state2": [F@359172db, "gameVariables": {"cometConfig": 4, "debrisConfig": 3 } }",
		timestamp: 1392305934000,
		tournamentsMatchCollection: null,
	}];
}]);