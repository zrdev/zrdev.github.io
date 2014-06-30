zr.controller('SubmitModalController', ['$scope', '$modalInstance', 'projectText', 'teamResources', 'competitionResources', 'zrdb', 'game',
		function($scope, $modalInstance, projectText, teamResources, competitionResources, zrdb, game) {
	$scope.projectText = projectText;
	$scope.teams = teamResources.data.rows || [];
	$scope.competitions = [];
	$scope.data = {
		team: $scope.teams[0] || { name: '', id: 0 },
		competition: {name: '' },
		agree: false
	};
	$scope.aceOptions = {
		theme:'chrome',
		mode: 'c_cpp',
		showPrintMargin: false
	};

	var compilePassed = false;
	var codesizePassed = false;
	$scope.validate = function() {
		$scope.showFloater = true;

		zrdb.compile({
			gameId: game.id,
			code: projectText,
			codesize: false
		}).then(function(response) { //Success callback
			compilePassed = true;
			if(codesizePassed) {
				submit();
			}
		}, function(response) { //Error callback
			alert('Your code does not compile. Please fix it and submit again.');
			$scope.cancel();
		});

		zrdb.compile({
			gameId: game.id,
			code: projectText,
			codesize: true
		}).then(function(response) { //Success callback
			if(response.codesizePct < game.emptyProjectSize + game.codesizeAllocation) {
				codesizePassed = true;
				if(compilePassed) {
					submit();
				}
			}
			else {
				alert('Your program is over the codesize allocation. Please make it smaller and submit again.');
				$scope.cancel();
			}
		}, function(response) { //Error callback
			alert('Your code does not compile. Please fix it and submit again.');
			$scope.cancel();
		});
	};
	
	var submit = function() {
		zrdb.addResource('submission', {
			'teamId': $scope.data.team.id,
			'competitionId': $scope.data.competition.id, 
			'code': projectText,
			'date': new Date().getTime()
		}, function() {
			$scope.cancel();
		});
	};

	//Iterate over all competitions to find which ones belong to the selected team
	$scope.findCompetitions = function(team) {
		var myCompetitions = [];
		var comps = competitionResources.data.rows;
		competitionLoop: //Label to break out of inner loops
		for(var i = comps.length; i--; ) {
			if(comps[i].gameId.id === game.id) {
				var divs = comps[i].divisionsCollection;
				for(var j = divs.length; j--; ) {
					var teams = divs[j].teamsCollection;
					for(var k = teams.length; k--; ) {
						if(teams[k].id === team.id) {
							myCompetitions.push(comps[i]);
							continue competitionLoop;
						}
					}
				}
			}
		}
		$scope.competitions = myCompetitions;
		if(myCompetitions.length) {
			$scope.data.competition = myCompetitions[0];
		}
	};
	$scope.findCompetitions($scope.data.team)
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]);
