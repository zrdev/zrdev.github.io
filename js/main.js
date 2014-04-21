//Initial module setup and URL routing

var zr = angular.module('zr', ['ui.bootstrap', 'ui.ace', 'ui.keypress', 'ngRoute', 'ngSanitize', 'uiSlider'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	//Use HTML5 URL rewriting instead of hash string
	$locationProvider.html5Mode(true);
	
	//Function to inject the Realtime doc into the editor controller
	var loadFile = function ($route, realtime, zrdb) {
		var id = $route.current.params['fileId'];
		return realtime.requireAuth(true).then(function () {
			return realtime.getDocument(id)
			.then(function(doc) {
				var id = doc.getModel().getRoot().get('gameId');
				return zrdb.getSingleResource('game', id)
				.then(function(game) {
					return [doc, game];
				});
			});
		});
	};
	loadFile.$inject = ['$route', 'realtime', 'zrdb'];

	var visualizationResources = function(zrdb) {
		//Chained dependent resources: first load the sim, then get the game based on the ID in the sim
		return zrdb.getSingleResource('simulation')
		.then(function(sim) {
			return zrdb.getSingleResource('game', sim.data.gameId)
			.then(function(game) {
				return [sim, game];
			});
		});
	};
	visualizationResources.$inject = ['zrdb'];

	var folderResource = function($route) {
		//Parse state parameter from Drive UI
		var state = $route.current.params['state'];
		state = JSON.parse(state);
		if(state.action === 'create') {
			return [{ id: state.folderId }];
		}
		return [];
	};
	folderResource.$inject = ['$route'];

	var teamResources = function($q) {
		var d = $q.defer();
		gapi.client.request({
			'path': '/admin/directory/v1/groups',
			'method': 'GET',
			'params': {
				'domain': 'zerorobotics.mit.edu'
			}
		})
		.execute(function(response){
			d.resolve(response);
		});
		return d.promise;
	};
	teamResources.$inject = ['$q'];

	var openRedirect = function(routeParams, path, search) {
		//Parse state parameter from Drive UI
		var state = search['state'];
		state = JSON.parse(state);
		if(state.action === 'open') {
			return '/ide/' + state.ids[0] + '/';
		}
		return '/';
	};

	var tournamentResource = function(zrdb) {
		return zrdb.getSingleResource('tournament');
	};
	tournamentResource.$inject = ['zrdb'];

	var tournamentResources = function(zrdb) {
		return zrdb.getAllResources('tournament');
	};
	tournamentResources.$inject = ['zrdb'];

	var previousProject = function($routeParams) {
		return $routeParams['fileId'];
	}
	previousProject.$inject = ['$routeParams'];

	//URL routing
	$routeProvider.when('/', {
		templateUrl: '/partials/frontpage.html'
	}).when('/announcements/', {
		templateUrl: '/partials/announcements-list.html',
		controller: 'AnnouncementsController'
	}).when('/announcements/:announcementId/', {
		templateUrl: '/partials/announcements-detail.html',
		controller: 'AnnouncementsController'
	}).when('/ide/simulation/:id/', {
		templateUrl: '/partials/visualization.html',
		controller: 'VisualizationController',
		resolve: {
			resources: visualizationResources,
			previousProject: previousProject
		}
	}).when('/ide/open/', {
		redirectTo: openRedirect
	}).when('/ide/new/', {
		template: '',
		controller: 'NewProjectController',
		resolve: {
			folder: folderResource
		}
	}).when('/ide/:fileId/', {
		templateUrl: '/partials/ide.html',
		controller: 'IdeController',
		resolve: {
			resources: loadFile
		}
	}).when('/tournaments/', {
		templateUrl: '/partials/tournaments-index.html',
		controller: 'TournamentsListController',
		resolve: {
			tournamentResources: tournamentResources
		}
	}).when('/tournaments/:id/', {
		templateUrl: '/partials/tournaments-info.html',
		controller: 'TournamentsInfoController',
		resolve: {
			tournamentResource: tournamentResource
		}
	}).when('/tournaments/:tournamentId/:mode/:resourceId/', {
		templateUrl: '/partials/tournaments-info.html',
		controller: 'TournamentsInfoController'
	}).when('/tutorials/', {
		templateUrl: '/partials/tutorials.html'
	}).when('/contact-us/', {
		templateUrl: '/partials/contact-us.html'
	}).when('/multimedia/', {
		templateUrl: '/partials/multimedia.html'
	}).when('/history/', {
		templateUrl: '/partials/history.html'
	}).when('/vision-mission/', {
		templateUrl: '/partials/vision-mission.html'
	}).when('/what-is-zr/', {
		templateUrl: '/partials/what-is-zr.html'
	}).when('/in-the-news/', {
		templateUrl: '/partials/in-the-news.html'
	}).when('/zr-team/', {
		templateUrl: '/partials/zr-team.html'
	}).when('/manage-teams/', {
		templateUrl: '/partials/team-management.html',
		controller: 'TeamManagementController', 
		resolve: {
			teamResources: teamResources
		}
	}).when('/forum/', {
		templateUrl: '/partials/forum.html',
		controller: 'ForumController'
	}).otherwise({
		redirectTo: '/'
	});
}])
//End URL routing

.config(['$httpProvider', function ($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])

.value('config', {
	clientId: '2809468685-i7or9cfoaaeg7vb9apsn068h690bdlkr.apps.googleusercontent.com',
	appId: 2809468685,
	apiKey: 'i7or9cfoaaeg7vb9apsn068h690bdlkr',
	scopes: [
		'https://www.googleapis.com/auth/drive.file',
		'https://www.googleapis.com/auth/drive.install',
		'profile'
	],
	//NO TRAILING SLASH on serviceDomain
	serviceDomain: 'http://zrwebsite-env.elasticbeanstalk.com'
});

	angular.element(document).ready(function () {
		angular.bootstrap(document, ['zr']);
	});


/**
 * Bootstrap the app
 */
/*gapi.load('auth:client:drive-share:drive-realtime', function () {
	gapi.auth.init();

	// Monkey patch collaborative string for ng-model compatibility
	Object.defineProperty(gapi.drive.realtime.CollaborativeString.prototype, 'text', {
		set: gapi.drive.realtime.CollaborativeString.prototype.setText,
		get: gapi.drive.realtime.CollaborativeString.prototype.getText
	});
	
	//This code copied from blockly/core/realtime.js; register Blockly custom types
	var custom = gapi.drive.realtime.custom;
	custom.registerType(Blockly.Block, 'Block');
	Blockly.Block.prototype.id = custom.collaborativeField('id');
	Blockly.Block.prototype.xmlDom = custom.collaborativeField('xmlDom');
	Blockly.Block.prototype.relativeX = custom.collaborativeField('relativeX');
	Blockly.Block.prototype.relativeY = custom.collaborativeField('relativeY');
	custom.setInitializer(Blockly.Block, Blockly.Block.prototype.initialize);
	
	angular.element(document).ready(function () {
		angular.bootstrap(document, ['zr']);
	});
});*/
