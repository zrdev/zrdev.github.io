zr.controller('RenameProjectController', ['$scope', '$modalInstance', 'drive', 'realtime', 'callback', function($scope, $modalInstance, drive, realtime, callback) {
	$scope.data = {
		name: ''
	};
	
	$modalInstance.opened.then(function() {
		$scope.data.shouldBeOpen = true;
		$scope.data.name='';
	});
	
	$scope.rename = function() {
		drive.renameFile($scope.data.name || 'Untitled', realtime.id, callback);
		$scope.data.shouldBeOpen = false;
		$modalInstance.close();
	};
	
	$scope.cancel = function() {
		$scope.data.shouldBeOpen = false;
		$modalInstance.dismiss('cancel');
	};
}]);
