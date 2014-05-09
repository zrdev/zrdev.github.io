zr.controller('ForumController', ['$scope', '$sce', function($scope, $sce) {
	$scope.forumUrl = $sce.trustAsResourceUrl('https://groups.google.com/a/zerorobotics.mit.edu/forum/embed/?place=forum/forum'
	    + '&showsearch=true&showpopout=false&showtabs=false'
	    + '&parenturl=' + encodeURIComponent(window.location.href));
}]);