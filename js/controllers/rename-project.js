zr.controller('RenameProjectController', function($scope, $modalInstance, realtime, drive) {
	$scope.data = {
		name: ''
	};
	
	$modalInstance.opened.then(function() {
		$scope.data.shouldBeOpen = true;
		$scope.data.name='';
	});
	
	$scope.rename = function() {
		realtime.requireAuth().then(function() {
			drive.renameFile($scope.data.name, realtime.id);
		});
		$scope.data.shouldBeOpen = false;
		$modalInstance.close();
	};
	
	$scope.cancel = function() {
		$scope.data.shouldBeOpen = false;
		$modalInstance.dismiss('cancel');
	};
});
