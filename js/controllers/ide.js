zr.controller('IdeController', function($scope, $modal, $http, $timeout, $location, config, realtime, drive, realtimeDocument) {
	$scope.model = realtimeDocument.getModel();
	var graphical = $scope.model.getRoot().get('graphical');
	$scope.graphical = graphical;
	$scope.editorMode = graphical ? 'graphical' : 'text';
	$scope.pages = $scope.model.getRoot().get('pages');
	$scope.currentPageName = '';
	$scope.currentPage = {
		text: ''
	};
	
	var collabLog = $scope.model.getRoot().get('log');
	$scope.log = null;
	var updateLog = function() {
		$scope.log = collabLog.items().sort(function(a,b) {
			return parseInt(b[0]) - parseInt(a[0]);
		});
	};
	updateLog();
	
	$scope.logFocus = '';
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
	
	$scope.focusLog = function(title) {
		if($scope.logFocus === title) {
			$scope.logFocus = '';
		}
		else {
			$scope.logFocus = title;
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
				
			},
			windowClass: {
				'width': '1000px'
			}
		}).result.then(function(data) {
			simulate(data);
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
	
	var getDocAsString = function() {
		if(!graphical) {
			var str = "";
			var keys = $scope.pages.keys().sort();
			var len = keys.length;
			for(var i = 0; i < len; i++) {
				str = str + '//Begin page ' + keys[i] + '\n' + $scope.pages.get(keys[i]).getText() + '\n//End page ' + keys[i] + '\n';
			}
			return str;
		}
		else {
			Blockly.Realtime.enabled_ = false;
			var tempSpace = 
			Blockly.Realtime.enabled_ = true;
		}
	};
	
	var CONNECTION_ERROR = 'The server did not respond. Please check your Internet connection and try again.'
			+ 'If this problem persists for more than a few minutes, please contact us at zerorobotics@mit.edu.'
	
	$scope.compile = function(codesize) {
		var data = {
			gameId: 24,
			code: getDocAsString(),
			codesize: codesize
		};
		
		var getCompilationStatus = function(id) {
			$timeout(function() {
				$http.get(config.serviceDomain + '/compilationresource/single/' + id)
				.success(function(data,status,headers,config) {
					if(data.status === 'COMPILING') {
							getCompilationStatus(id);
					}
					else if(data.status === 'SUCCEEDED') {
						$scope.logInsert('Compilation succeeded. '
								+ (typeof data.codesizePct === 'number' ? data.codesizePct + '% codesize usage.' : ''),
								data.message);
						$scope.logOpen = true;
					}
					else if(data.status === 'FAILED') {
						$scope.logInsert('Compilation failed.\n', data.message);
						$scope.logOpen = true;
					}
				})
				.error(function(data,status,headers,config) {
					alert(CONNECTION_ERROR);
				});
			}, 1000);
		};
		
		$http.post(config.serviceDomain + '/compilationresource/compile', data)
		.success(function(data,status,headers,config) {
			getCompilationStatus(data.id);
		})
		.error(function(data,status,headers,config) {
			alert(CONNECTION_ERROR);
		});
	}
	
	var simulate = function(dataIn) {
		var data = {
			"gameId": 24,
			"snapshot1": 94857,
			"snapshot2": 203458,
			"simConfig": {
				"timeout": dataIn.timeout,
				"state1": dataIn.sph1init,
				"state2": dataIn.sph2init,
				"gameVariables": dataIn.gameVars
			}
		};

		var emptyCode = "void init() {} void loop() {}";

		if(dataIn.sph === 1) {
			data['code1'] = getDocAsString();
			data['code2'] = emptyCode;
		}
		else {
			data['code2'] = getDocAsString();
			data['code1'] = emptyCode;
		}
		
		var getSimStatus = function(id) {
			$timeout(function() {
				$http.get(config.serviceDomain + '/simulationresource/single/' + id)
				.success(function(data,status,headers,config) {
					if(data.status === 'COMPILING' || data.status === 'SIMULATING') {
							getSimStatus(id);
					}
					else if(data.status === 'SUCCEEDED') {
						$scope.logInsert('Simulation succeeded',
								data.message, id);
						$scope.logOpen = true;
					}
					else if(data.status === 'FAILED') {
						$scope.logInsert('Simulation failed.\n', data.message);
						$scope.logOpen = true;
					}
				})
				.error(function(data,status,headers,config) {
					alert(CONNECTION_ERROR);
				});
			}, 1000);
		};
		$http.post(config.serviceDomain + '/simulationresource/simulate', data)
		.success(function(data,status,headers,config) {
			getSimStatus(data.id);
		})
		.error(function(data,status,headers,config) {
			alert(CONNECTION_ERROR);
		});
	}
	
	$scope.download = function() {
		//Create phantom link with data URI to download content. Needed to specify the name of the file with 
		//download attribute (window.open gives the file a random name in Firefox.)
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
	
	//Callback to load Blockly when everything is rendered
	if(graphical) {
		//This triggers after the DOM is all compiled/rendered
		$timeout(function() {
			Blockly.inject(document.getElementById('blockly-frame'),{path:'/blockly/',toolbox: document.getElementById('blockly-toolbox')});
			//Scroll over to keep procedure in center
			var dims = Blockly.mainWorkspace.getMetrics();
			Blockly.mainWorkspace.scrollX += dims.viewWidth / 3;
			Blockly.mainWorkspace.scrollY += dims.viewHeight / 4;
			Blockly.Realtime.loadPage($scope.currentPageName);
		});
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
});
