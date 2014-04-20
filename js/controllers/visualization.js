zr.controller('VisualizationController', ['$scope', '$sce', '$timeout', 'resources', function($scope, $sce, $timeout, resources) {
	$scope.isFullScreen = function() {
		return !!(document.fullscreenElement ||
				document.mozFullScreenElement || 
				document.webkitFullscreenElement ||
				document.msFullscreenElement);
	};
	$scope.enterFullScreen = function() {
		var elem = document.getElementsByClassName('page-content')[0];
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} 
		else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();
		} 
		else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} 
		else if (elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
		} 
	};
	
	$scope.exitFullScreen = function() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} 
		else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} 
		else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} 
		else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	};
	
	//Run a digest on entering/exiting full screen
	angular.element(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange msfullscreenchange', function() {
		$scope.$digest();
	});
	
	$scope.speed = 1;
	$scope.state = 'stop';
	$scope.time = 0;
	//resources[1] is the game resource. Needs to be trusted because this is interpolated into a src attribute.
	$scope.swfUrl = $sce.trustAsResourceUrl('/visualizer/ZRVis.swf?config=/visualizer/' + resources[1].data.visCfgFile + '&staticbase=/visualizer/');
	
	var userSliding = true;
	var simLoaded = false;
	var simobject;
	$timeout(function() {
		simobject = document.getElementById('cubesphere_embed');
	});

	$scope.consoleOn = true;
	$scope.$watch('consoleOn', function() {
		if(simLoaded) {
			simobject.asEnableConsole($scope.consoleOn);
		}
	});

	$scope.bgOn = true;
	$scope.$watch('bgOn', function() {
		if(simLoaded) {
			simobject.asBgImageOn($scope.bgOn);
		}
	});

	//these must be global because they are called by Flash
	window.setTimeSlider = function(pos) {
		$scope.$apply(function(){
			if(pos >= 100 && $scope.state === 'play') {
				$scope.playPause();
			}
			else {
				$scope.time = pos;
			}
		});
	};
	window.timelineComplete = function() {
		if($scope.state === 'play') {
			$scope.playPause();
		}
	};
	window.asLoadComplete = function() {
		//resources[0] is the simulation
		simobject.asLoadDirect(resources[0].data.simData);
		simLoaded = true;
	}

	$scope.setTime = function(time) {
		simobject.asSetTime(time/100);
	};
					
	$scope.playPause = function() {
		if ($scope.state === 'stop') {
			simobject.asStart();
			$scope.state = 'play';
		}
		else if ($scope.state === 'pause'){
			simobject.asResume();
			$scope.state = 'play';
		}
		else {
			simobject.asPause();
			$scope.state = 'pause';
		}
	};
				
	$scope.stop = function() {
		simobject.asPause();
		$scope.state = 'stop';
		$scope.time = 0;
		$scope.setTime(0);
	};
				
	$scope.zoomIn = function(){
		simobject.asZoomIn(10);
	};
	
	$scope.zoomOut = function(){
		simobject.asZoomOut(10);
	};
					
	$scope.resetCam = function(){
		simobject.asZoomReset();
		simobject.asCameraReset();
	};
					
	$scope.setSpeed = function(speed){
		simobject.asSpeed(speed);
	};


}]);
