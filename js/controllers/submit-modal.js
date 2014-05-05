zr.controller('SubmitModalController', ['$scope', '$modalInstance', 'projectText', function($scope, $modalInstance, projectText) {
	$scope.projectText = projectText;
	$scope.teams = [
		{
			name: 'Team 1'
		},
		{
			name: 'Team 2'
		}
	];
	$scope.competitions = [
		{
			name: 'Competition 1'
		},
		{
			name: 'Competition 2'
		}
	];
	$scope.data = {
		team: $scope.teams[0],
		competition: $scope.competitions[0],
		agree: false
	};
	$scope.aceOptions = {
		theme:'chrome',
		mode: 'c_cpp',
		showPrintMargin: false
	};
	
	$scope.submit = function() {
		$modalInstance.close('');
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
}]);
