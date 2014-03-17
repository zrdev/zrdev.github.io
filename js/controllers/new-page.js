zr.controller('NewPageController', function($scope, $modalInstance, isGraphical) {
	$scope.data = {
		name: '',
		returnValue: false
	};
	$scope.graphical = isGraphical;
	
	$modalInstance.opened.then(function() {
		$scope.data.shouldBeOpen = true;
		$scope.data.name='';
		$scope.data.returnValue = false;
	});
	
	$scope.createPage = function() {
		$scope.data.shouldBeOpen = false;
		$modalInstance.close({
			title: $scope.data.name, 
			returnValue: $scope.data.returnValue
		});
	};
	
	$scope.cancel = function() {
		$scope.data.shouldBeOpen = false;
		$modalInstance.dismiss('cancel');
	};
});
