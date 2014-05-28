zr.controller('SubmitModalController', ['$scope', '$modalInstance', 'projectText', 'teamResources', 'competitionResources', 
		function($scope, $modalInstance, projectText, teamResources, competitionResources) {
	$scope.projectText = projectText;
	$scope.teams = teamResources.data.rows || [];
	$scope.competitions = competitionResources.data.rows || [];
	$scope.data = {
		team: $scope.teams[0] || { name: '' },
		competition: $scope.competitions[0] || { name: '' },
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
