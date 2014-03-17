zr.controller('VisualizationController', function($scope) {
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
	$scope.playing = false;
	
	var userSliding = false;
	var simLoaded = false;
	var simPaused = false;
	simobject = document.getElementById('cubesphere_embed');
				
	$scope.setTime = function() {
			simobject.asSetTime(value/100);
	};
					
	$scope.playPause = function() {
		if (simPaused) {
			if (!simLoaded){
				simLoaded = true;
				simobject.asLoadSim("simrun1.xml");
			} else {
				if (!simPaused){
					simobject.asStart();
				} else {
					simobject.asResume();
				}
			}
		} else {
			simobject.asPause();
			simPaused = true;
		}
	};
				
	$scope.stop = function() {
		simobject.asPause();
		simPaused = false;
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
					
	$scope.setSpeed = function(val){
		simobject.asSpeed(val);
	};
});
