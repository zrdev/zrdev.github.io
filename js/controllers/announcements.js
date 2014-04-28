zr.controller('AnnouncementsController', ['$scope', '$routeParams', function($scope, $routeParams) {
	$scope.data = {};
	$scope.data.announcements = [
		{
			id: 1,
			title: 'Welcome to our new website!',
			date: 1397848177072,
			user: 'Ethan DiNinno',
			content: '<p>We\'ve revamped our website for the 2014 season. Take a look around! </p><p>If you need to retrieve data from the old website, it\'s still available <a href="http://zerorobotics.org/" target="_blank">here</a>. </p>'
			+ '<p>Some pages on this new website are still under construction. They are clearly labeled as such and we are working on finishing them. </p>'
			+ '<p>The website now uses Google federated login. Any account used on Gmail, Google Docs, YouTube, etc. will work. If you don\'t have a Google account, you can create one <a href="https://accounts.google.com/SignUp" target="_blank">here</a>. </p>'
			+ '<p>If you have any questions about this transition, please contact us at <a href="mailto:zerorobotics@mit.edu" target="_blank">zerorobotics@mit.edu</a>. </p>' 
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
