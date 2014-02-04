zr.controller('NewProjectModalController', function($scope, $modalInstance, $location, realtime) {
	$scope.data = {
		name: ''
	};
	
	$modalInstance.opened.then(function() {
		$scope.data.shouldBeOpen = true;
		$scope.data.name='';
	});
	
	$scope.createProject = function() {
		realtime.requireAuth().then(function () {
			realtime.createDocument($scope.data.name).then(function (file) {
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
		window.history.back();
		$modalInstance.dismiss('cancel');
	};
});
