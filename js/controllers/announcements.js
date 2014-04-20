zr.controller('AnnouncementsController', ['$scope', '$routeParams', function($scope, $routeParams) {
	$scope.data = {};
	$scope.data.announcements = [
		{
			id: 1,
			title: 'Welcome to our new website!',
			date: 1397848177072,
			user: 'Ethan DiNinno',
			content: '<p>We\'ve revamped our website for the 2014 season. Take a look around! </p><p>If you need to retrieve data from the old website, it\'s still available <a href="http://zerorobotics.org/">here</a>.</p>'
		}
	];
	$scope.data.announcement = null;
	var len = $scope.data.announcements.length;
	var announcementId = parseInt($routeParams['announcementId']);
	for(var i = 0; i < len; i++) {
		if ($scope.data.announcements[i].id === announcementId) {
			$scope.data.announcement = $scope.data.announcements[i];
			break;
		}
	}
	$scope.data.currentPage = 1;
}]);
