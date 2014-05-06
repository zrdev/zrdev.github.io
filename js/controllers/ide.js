zr.controller('IdeController', ['$scope', '$modal', '$http', '$timeout', '$location', 'config', 'realtime', 'drive', 'resources', 'zrdb', 
		function($scope, $modal, $http, $timeout, $location, config, realtime, drive, resources, zrdb) {
	var realtimeDocument = resources[0];
	$scope.model = realtimeDocument.getModel();
	var graphical = $scope.model.getRoot().get('graphical');
	$scope.graphical = graphical;
	$scope.editorMode = graphical ? 'graphical' : 'text';
	$scope.pages = $scope.model.getRoot().get('pages');
	$scope.currentPageName = '';
	$scope.currentPage = {
		text: ''
	};
	$scope.simRunning = false;
	if(graphical && resources[1].data.hllBlockSet) {
		$scope.blocklyTreeUrl = '/blockly/games/' + resources[1].data.hllBlockSet + 'tree.xml';
	}
	else {
		$scope.blocklyTreeUrl = null;
	}
	
	var collabLog = $scope.model.getRoot().get('log');
	$scope.log = null;
	var updateLog = function() {
		$scope.log = collabLog.items().sort(function(a,b) {
			return parseInt(b[0]) - parseInt(a[0]);
		});
	};
	updateLog();
	
	$scope.logOpen = false;
	$scope.chat = {
		message: ''
	};
	
	$scope.projectName = '';
	var setProjectName = function() {
		drive.getFileMetadata(realtime.id, function(data) {
			$timeout(function() {
				$scope.projectName = data.title;
			});
		});
	}
	setProjectName();
	
	$scope.blocklyText='';
	$scope.aceEditor = null;
	$scope.aceOptions = {
		theme:'chrome',
		mode: 'c_cpp',
		showPrintMargin: false,
		onLoad: function(ace) {
			$scope.aceEditor = ace;
		}
	};

	$scope.newProject = function() {
		drive.newProject();
	}
	
	$scope.openProject = function() {
		drive.openProject();
	}
	
	$scope.focusLog = function(item) {
		if(item.content) {
			var template = '<div class="modal-header"><button type="button" class="close" aria-hidden="true" ng-click="$dismiss()">&times;</button><h4 class="modal-title">'
				+ item.title + '</h4></div><div class="modal-body log-body">'
				+ item.content + '</div>';
			$modal.open({
				template: template
			});
		}
	};
	
	var logRemoteChange = function(e) {
		if(!e.isLocal) {
			$scope.$apply(updateLog);
		}
	};
	collabLog.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, logRemoteChange);
	
	var getMyName = function() {
		var collaborators = realtimeDocument.getCollaborators();
		var len = collaborators.length;
		for(var i = 0; i < len; i++) {
			if(collaborators[i].isMe) {
				return collaborators[i].displayName;
			}
		}
		return 'Anonymous';
	}
	
	//Opens the new page dialog
	$scope.newPage = function() {
		$modal.open({
			templateUrl: '/partials/new-page-modal.html',
			controller: 'NewPageController',
			resolve: {
				isGraphical: function(){ return graphical; }
			}
		}).result.then(function(result) {
			if(result.title==='') {
				alert('Enter a page name.');
				return;
			}
			if($scope.pages.has(result.title)) {
				alert('Page "' + result.title + '" already exists.');
				return;
			}
			if(!graphical) {
				$scope.pages.set(result.title, $scope.model.createString(''));
			}
			else {
				if(!Blockly.Blocks.CNameValidator(result.title)) {
					alert('Not a valid C function name.');
					return;
				}
				var pageRoot = $scope.model.createMap();
				$scope.pages.set(result.title, pageRoot);
				//This code copied from blockly/core/realtime.js
				var blocksMap = $scope.model.createMap();
				pageRoot.set('blocks', blocksMap);
				var topBlocks = $scope.model.createList();
				pageRoot.set('topBlocks', topBlocks);
				pageRoot.set('type',result.returnValue ? 'return' : 'noreturn');
			}
			$scope.setActivePage(result.title);
		});
	};

	$scope.go = function (path) {
		$location.path( path );
	};
	
	//Opens the simulation dialog
	$scope.openSimDialog = function() {
		$modal.open({
			templateUrl: '/partials/simulation-modal.html',
			controller: 'SimulationController',
			resolve: {
				gameResource: function() {
					return resources[1];
				}
			},
			windowClass: {
				'max-width': '800px'
			}
		}).result.then(function(data) {
			simulate(data);
		});
	};

	//Opens the submission dialog
	$scope.openSubmitDialog = function() {
		$modal.open({
			templateUrl: '/partials/submit-modal.html',
			controller: 'SubmitModalController',
			resolve: {
				projectText: function() { return realtime.getDocAsString($scope.model.getRoot()); }
			}
		}).result.then(function(data) {
		});
	};
	
	//Opens the project rename dialog
	$scope.renameProject = function() {
		$modal.open({
			templateUrl: '/partials/rename-project-modal.html',
			controller: 'RenameProjectController', 
			resolve: {
				callback: function() { return setProjectName; }
			}
		});
	};
	
	$scope.deletePage = function(title) {
		if(title === 'main') {
			alert('The main page cannot be deleted.');
			return;
		}
		if(!$scope.pages.has(title)) {
			alert('Page "' + title + '" does not exist.');
			return;
		}
		if(graphical && title === 'init') {
			alert('The init page cannot be deleted.');
			return;
		}
		//Dispose of blocks properly to avoid ghost procedures, etc.
		if(graphical) {
			Blockly.mainWorkspace.clear();
		}
		$scope.pages.delete(title);
		$scope.setActivePage('main');
	};
	
	//Changes the active page
	$scope.setActivePage = function(title) {
		if(!$scope.pages.has(title)) {
			alert('Page "' + title + '" does not exist.');
			return;
		}
		$scope.currentPageName = title;
		$scope.currentPage = $scope.pages.get(title);
		if(graphical && Blockly.mainWorkspace && Blockly.mainWorkspace.getMetrics()) {
			Blockly.Realtime.loadPage($scope.currentPageName);
			//Reload the Blockly toolbox to account for changes in blocks
			$timeout(function() {
				if(Blockly.Toolbox.HtmlDiv && graphical) {
					Blockly.Toolbox.HtmlDiv.innerHTML = '';
					Blockly.languageTree = document.getElementById('blockly-toolbox');
					Blockly.Toolbox.init();
				}
			}, 0);
		}
		//If Blockly is not yet loaded, it will load the page on its own when it finishes
		
		//Exit the read-only C mode in a graphical project
		$scope.editorMode = graphical ? 'graphical' : 'text';
	};
	

	$scope.testGen = function() {
		alert(realtime.getDocAsString($scope.model.getRoot()));
	}
	
	var parseErrorMessage = function(msg) {
		var re = /^\/zr.cpp:([0-9]+):([0-9]+): (error|warning): (.*)$/gm;
		var toIgnore = '‘game’ defined but not used [-Wunused-variable]\n'
			+ '‘api’ defined but not used [-Wunused-variable]\n';
		var errors = [];
		do {
		    err = re.exec(msg);
		    //The toIgnore check ignores certain useless warnings
		    if (err && toIgnore.indexOf(err[5]) !== -1) {
		    	//Get rid of GCC junk
		    	err[5] = err[5].replace(' [-Wunused-variable]','');
		        errors.push(err);
		    }
		} while (err);
		return errors;
	};

	
	$scope.compile = function(codesize) {
		var data = {
			gameId: $scope.model.getRoot().get('gameId'),
			code: realtime.getDocAsString($scope.model.getRoot()),
			codesize: codesize
		};
		
		zrdb.compile(data).then(function(response) { //Success callback
			//Convert from number of words to percentage
			var size = response.codesizePct;
			if(size > 0) {
				size = Math.ceil((size - resources[1].data.emptyProjectSize) * 100 / resources[1].data.codesizeAllocation)
			}
			else {
				size = null;
			}
			//Parse 
			$scope.logInsert('Compilation succeeded. '
					+ (size !== null ? size + '% codesize usage.\n' : '\n'),
					response.message);
		}, function(response) { //Error callback
			//Flatten error messages into string
			var errors = JSON.parse(response.message).errors;
			var errorString = '';
			for(var i = errors.length; i--;) {
				errorString = errorString.concat(errors[i].error + '\n');
			}
			$scope.logInsert('Compilation failed.\n', errorString);
			console.log(parseErrorMessage(errorString));
		}).finally(function() {
			$scope.logOpen = true;
			$scope.simRunning = false;
		});

		$scope.simRunning = true;
	}
	
	var simulate = function(dataIn) {
		var data = {
			"gameId": $scope.model.getRoot().get('gameId'),
			"snapshot1": 94857,
			"snapshot2": 203458,
			"simConfig": {
				"timeout": dataIn.timeout,
				"state1": dataIn.sph1init,
				"state2": dataIn.sph2init,
				"gameVariables": dataIn.gameVars
			}
		};

		if(dataIn.sph === 1) {
			data['code1'] = realtime.getDocAsString($scope.model.getRoot());
			data['code2'] = dataIn.opponentCode;
		}
		else {
			data['code2'] = realtime.getDocAsString($scope.model.getRoot());
			data['code1'] = dataIn.opponentCode;
		}

		zrdb.compile(data, true).then(function(response) { //Success callback
			$scope.logInsert('Simulation succeeded.\n', response.message, response.id);
		}, function(response) { //Error callback
			$scope.logInsert('Simulation failed.\n', response.message);
		}).finally(function() {
			$scope.logOpen = true;
			$scope.simRunning = false;
		});
		
		$scope.simRunning = true;
	}
	
	$scope.download = function() {
		//Create phantom link with data URI to download content. Needed to specify the name of the file with 
		//download attribute (window.open gives the file a random name in Firefox.)
		var link = document.createElement('a');
		link.setAttribute('href', 'data:text/x-c,' + encodeURIComponent(realtime.getDocAsString($scope.model.getRoot())));
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
	
	$scope.logInsert = function(title, content, simId) {
		//Log entries are identified by timestamp, plus some random digits to avoid collisions
		var key = String(new Date().getTime() + Math.random());
		var value = {
			user: getMyName(),
			title: title,
			content: content,
			simId: simId
		}
		collabLog.set(key, value);
		updateLog();
	};
	
	
	$scope.toggleBlocklyText = function(title, content) {
		if($scope.editorMode === 'graphical-c') {
			$scope.editorMode = 'graphical';
		}
		else if($scope.editorMode === 'graphical') {
			$scope.blocklyText = Blockly.zr_cpp.workspaceToCode();
			$scope.editorMode = 'graphical-c';
		}
	}
	
	var shareClient = null;
	$scope.share = function() {
		if(!shareClient) {
			shareClient = new gapi.drive.share.ShareClient(config.appId);
		}
		shareClient.setItemIds(realtime.id);
		shareClient.showSettingsDialog();
	};

	//Blockly cut/copy/paste callbacks
	$scope.cut = function() {
		if(graphical) {
	        Blockly.copy_(Blockly.selected);
	        Blockly.selected.dispose(true, true);
		}
	}

	$scope.copy = function() {
		if(graphical) {
	        Blockly.copy_(Blockly.selected);
		}
	}

	$scope.paste = function() {
		if(graphical && Blockly.clipboard_) {
	        Blockly.mainWorkspace.paste(Blockly.clipboard_);
		}
	}


	
	//Callback to load Blockly when everything is rendered
	if(graphical) {
		$scope.loadBlockly = function() {
			Blockly.inject(document.getElementById('blockly-frame'),{path:'/blockly/',toolbox: document.getElementById('blockly-toolbox')});
			//Scroll over to keep procedure in center
			var dims = Blockly.mainWorkspace.getMetrics();
			Blockly.mainWorkspace.scrollX += dims.viewWidth / 3;
			Blockly.mainWorkspace.scrollY += dims.viewHeight / 4;
			Blockly.Realtime.loadPage($scope.currentPageName);
		};
		//This triggers after the DOM is all compiled/rendered
		if(!$scope.blocklyTreeUrl) {
			$timeout($scope.loadBlockly);
		}
	}
	
	
	//Listener to log leaving the document
	var closeAction = function() {
		//$scope.logInsert('Stopped editing','');
		collabLog.removeEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, logRemoteChange);
		return null;
	};
	//TODO: This is disabled because it has lots of timing issues
	//For leaving ZR
	//window.addEventListener('beforeunload',closeAction,false);
	//For switching views within Angular
	$scope.$on("$destroy", closeAction);
	
	//Last initialization
	$scope.logInsert('Started editing','');
	$scope.setActivePage('main');
}]);
