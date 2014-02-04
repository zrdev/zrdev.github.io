zr.controller('NewProjectController', function($scope, $modal) {
	$modal.open({
		templateUrl: 'partials/new-project-modal.html',
		controller: 'NewProjectModalController'
	});
});
