zr.controller('NewProjectModalController', function($scope, $modalInstance, $location, realtime) {
	$scope.data = {
		name: '',
		editorMode: 'text'
	};
	
	$modalInstance.opened.then(function() {
		$scope.data.shouldBeOpen = true;
		$scope.data.name = '';
		$scope.data.editorMode = 'text';
	});
	
	$scope.createProject = function() {
		realtime.requireAuth().then(function () {
			realtime.createDocument($scope.data.name).then(function (file) {
				realtime.ideGraphical = $scope.data.editorMode === 'graphical';
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
	};
});
