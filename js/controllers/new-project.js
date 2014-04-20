zr.controller('NewProjectController', ['$scope', 'drive', 'folder', function($scope, drive, folder) {
	drive.newProject(folder);
}]);
