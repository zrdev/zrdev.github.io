zr.controller('NewPageController', function($scope, $modalInstance) {
	$scope.data = {
		name: ''
	};
	
	$modalInstance.opened.then(function() {
		$scope.data.shouldBeOpen = true;
		$scope.data.name='';
	});
	
	$scope.createPage = function() {
		$scope.data.shouldBeOpen = false;
		$modalInstance.close($scope.data.name);
	};
	
	$scope.cancel = function() {
		$scope.data.shouldBeOpen = false;
		$modalInstance.dismiss('cancel');
	};
});
