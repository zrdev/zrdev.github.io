zr.controller('IdeController', function($scope, $modal, config, realtimeDocument) {
	var model = realtimeDocument.getModel();
	$scope.pages = model.getRoot().get('pages');
	$scope.currentPageName = '';
	$scope.currentPage = {
		text: ''
	};
	$scope.log = model.getRoot().get('log');
	$scope.chat = {
		message: ''
	};
	$scope.editorMode = 'graphical';
	
	//TODO: Replace this hack
	$scope.windowHeight = window.innerHeight;
	
	//Opens the new page dialog
	$scope.newPage = function() {
		$modal.open({
			templateUrl: 'partials/new-page-modal.html',
			controller: 'NewPageController'
		}).result.then(function(title) {
			if(!$scope.pages.has(title)) {
				$scope.pages.set(title, model.createString(''));
				$scope.setActivePage(title);
			}
			else {
				alert('Page "' + title + '" already exists.');
			}
		});
	};
	
	//Opens the project rename dialog
	$scope.renameProject = function() {
		$modal.open({
			templateUrl: 'partials/rename-project-modal.html',
			controller: 'RenameProjectController'
		});
	};
	
	$scope.deletePage = function(title) {
		if(title !== 'main') {
			if($scope.pages.has(title)) {
				$scope.pages.delete(title);
				$scope.setActivePage('main');
			}
			else {
				alert('Page "' + title + '" does not exist.');
			}
		}
		else {
			alert('The main page cannot be deleted.');
		}
	};
	
	//Changes the active page
	$scope.setActivePage = function(title) {
		if(!$scope.pages.has(title)) {
			alert('Page "' + title + '" does not exist.');
			return;
		}
		$scope.currentPageName = title;
		$scope.currentPage = $scope.pages.get(title);
	};
	
	var getDocAsString = function() {
		var str = "";
		var keys = $scope.pages.keys().sort();
		var len = keys.length;
		for(var i = 0; i < len; i++) {
			str = str + '//Begin page ' + keys[i] + '\n' + $scope.pages.get(keys[i]).getText() + '\n//End page ' + keys[i] + '\n';
		}
		return str;
	};
	
	$scope.download = function() {
		//Create phantom link with data URI to download content. Needed to specify the name of the file with download attribute (window.open gives the file a random name in Firefox.)
		var link = document.createElement('a');
		link.setAttribute('href', 'data:text/x-c,' + encodeURIComponent(getDocAsString()));
		link.setAttribute('download', 'project.cpp');
		link.setAttribute('target', '_blank');
		var randomDiv = document.getElementById('main-collapse');
		randomDiv.appendChild(link);
		//Need to pause here for some reason
		setTimeout(function() {
			link.click();
			randomDiv.removeChild(link);
		}, 100);
	};
	
	$scope.sendChatMessage = function() {
		$scope.logInsert($scope.chat.message, '');
		$scope.chat.message = '';
	};
	
	$scope.logInsert = function(title, content) {
		//Log entries are identified by timestamp, plus some random digits to avoid collisions
		var key = String(new Date().getTime() + Math.random());
		$scope.log.set(key, {
			user: 'Ethan DiNinno', //TODO: Actually implement this
			title: title,
			content: content
		});
	};
	
	//Last initialization
	$scope.setActivePage('main');
});
