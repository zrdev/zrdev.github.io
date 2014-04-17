zr.controller('NewProjectModalController', function($scope, $modalInstance, $location, realtime, folder, gameResources) {
	$scope.games = gameResources.data.rows;
	$scope.data = {
		shouldBeOpen: true,
		name: '',
		editorMode: 'text',
		game: $scope.games[0]
	};
	
	$modalInstance.opened.then(function() {
		$scope.data.shouldBeOpen = true;
		$scope.data.name = '';
	});
	
	$scope.createProject = function() {
		realtime.requireAuth().then(function () {
			realtime.createDocument($scope.data.name + ' - ' + $scope.data.game.displayName, folder).then(function (file) {
				realtime.ideGraphical = $scope.data.editorMode === 'graphical';
				realtime.gameId = $scope.data.game.id;
				$location.url('/ide/' + file.id + '/');
			});
		}, function () {
			realtime.requireAuth();
		});
		$scope.data.shouldBeOpen = false;
		$modalInstance.close();
	};
	
	$scope.cancel = function() {
		$scope.data.shouldBeOpen = false;
		$modalInstance.dismiss('cancel');
		if(folder) { //Redirected from Drive
			$location.path('/');
		}
	};
});
