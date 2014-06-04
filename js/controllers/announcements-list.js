zr.controller('AnnouncementsListController', ['$scope', 'announcementResources', function($scope, announcementResources) {
	$scope.data = {
		announcements: announcementResources.data.rows
	};
	$scope.data.currentPage = 1;
}]);
