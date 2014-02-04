//Initial module setup and URL routing

var zr = angular.module('zr', ['ui.bootstrap', 'ui.ace', 'ui.keypress', 'ngRoute', 'ngSanitize'])
.config(function($routeProvider) {
	
	//Function to inject the Realtime doc into the editor controller
	var loadFile = function ($route, realtime) {
		var id = $route.current.params.fileId;
		return realtime.requireAuth(true).then(function () {
			return realtime.getDocument(id);
		});
	};
	loadFile.$inject = ['$route', 'realtime'];

	$routeProvider.when('/ide/new-project/', {
		template: '',
		controller: 'NewProjectController'
	}).when('/ide/open-project/', {
		template: '',
		controller: 'OpenProjectController'
	}).when('/ide/:fileId/', {
		templateUrl: 'partials/ide.html',
		controller: 'IdeController',
        resolve: {
          realtimeDocument: loadFile
        }
	}).when('/tournaments/', {
		templateUrl: 'partials/tournaments-index.html',
		controller: 'TournamentsListController'
	}).when('/tournaments/:tournamentId/', {
		templateUrl: 'partials/tournaments-info.html',
		controller: 'TournamentsInfoController'
	}).when('/tournaments/:tournamentId/:mode/:resourceId/', {
		templateUrl: 'partials/tournaments-info.html',
		controller: 'TournamentsInfoController'
	}).when('/tutorials/', {
		templateUrl: 'partials/tutorials.html'
	}).when('/contact-us/', {
		templateUrl: 'partials/contact-us.html'
	}).when('/multimedia/', {
		templateUrl: 'partials/multimedia.html'
	}).when('/history/', {
		templateUrl: 'partials/history.html'
	}).when('/vision-mission/', {
		templateUrl: 'partials/vision-mission.html'
	}).when('/in-the-news/', {
		templateUrl: 'partials/in-the-news.html'
	}).when('/zr-team/', {
		templateUrl: 'partials/zr-team.html'
	}).otherwise({
		
	});
});

zr.value('config', {
	clientId: '2809468685-i7or9cfoaaeg7vb9apsn068h690bdlkr.apps.googleusercontent.com',
	appId: 2809468685,
	apiKey: 'i7or9cfoaaeg7vb9apsn068h690bdlkr',
	scopes: [
		'https://www.googleapis.com/auth/drive.file',
		'https://www.googleapis.com/auth/drive.install'
	]
});

/**
 * Bootstrap the app
 */
gapi.load('auth:client:drive-share:drive-realtime', function () {
	gapi.auth.init();

	// Monkey patch collaborative string and list for ng-model compatibility
	Object.defineProperty(gapi.drive.realtime.CollaborativeString.prototype, 'text', {
		set: gapi.drive.realtime.CollaborativeString.prototype.setText,
		get: gapi.drive.realtime.CollaborativeString.prototype.getText
	});
	Object.defineProperty(gapi.drive.realtime.CollaborativeList.prototype, 'arrayContent', {
		set: function(a){},
		get: gapi.drive.realtime.CollaborativeList.prototype.asArray
	});

	angular.element(document).ready(function () {
		angular.bootstrap(document, ['zr']);
	});
});
