zr.controller('SubmitModalController', ['$scope', '$modalInstance', 'projectText', function($scope, $modalInstance, projectText) {
	$scope.projectText = projectText;
	$scope.data = {
		team: 'Team 1',
		competition: 'Competition 2'
	};
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
