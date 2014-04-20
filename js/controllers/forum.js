zr.controller('ForumController', ['$scope', '$sce', function($scope, $sce) {
	$scope.forumUrl = $sce.trustAsResourceUrl('https://groups.google.com/forum/embed/?place=forum/zr-forum'
	    + '&showsearch=true&showpopout=false&showtabs=false'
	    + '&parenturl=' + encodeURIComponent(window.location.href));
}]);