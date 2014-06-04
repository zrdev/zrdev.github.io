zr.controller('AnnouncementsDetailController', ['$scope', 'announcementResource', function($scope, announcementResource) {
	$scope.data = {
		announcement: announcementResource
	};
}]);
