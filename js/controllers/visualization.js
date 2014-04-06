zr.controller('VisualizationController', function($scope, simResource) {
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
	
	var userSliding = false;
	var simLoaded = false;
	var simobject = document.getElementById('cubesphere_embed');
				
	$scope.setTime = function() {
			simobject.asSetTime(value/100);
	};
					
	$scope.playPause = function() {
		if ($scope.state === 'stop') {
			if (!simLoaded) {
				simLoaded = true;
				simobject.asLoadDirect(simResource.data.simData);
			} 
			else {
				simobject.asStart();
			}
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
	};
				
	$scope.zoomIn = function(){
		simobject.asZoomIn(10);
	};
	
	$scope.zoomOut = function(){
		simobject.asZoomOut(10);
	};
				
	$scope.toggleConsole = function(val){
		simobject.asEnableConsole(val);
	};
					
	$scope.toggleBg = function(val){
		simobject.asBgImageOn(val);
	};
					
	$scope.resetCam = function(){
		simobject.asZoomReset();
		simobject.asCameraReset();
	};
					
	$scope.setSpeed = function(speed){
		simobject.asSpeed(speed);
	};
});
