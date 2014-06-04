zr.controller('AnnouncementsListController', ['$scope', 'announcementResources', function($scope, announcementResources) {
	$scope.data = {
		announcements: announcementResources.rows
	};
	$scope.data.currentPage = 1;
}]);
