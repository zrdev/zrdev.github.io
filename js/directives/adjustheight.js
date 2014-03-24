//Adjusts the height of components to fit in the window

zr.directive('adjustheight', function($window, $timeout) {
	return {
		link: function(scope, element, attrs) {
			var offset = parseInt(attrs.adjustheight);
			var lastHeight = null;
			var update = function() {
				var height = 0;
				if(document.fullscreenElement ||
						document.mozFullScreenElement || 
						document.webkitFullscreenElement ||
						document.msFullscreenElement) {
					height = screen.height;
				}
				else {
					height = window.innerHeight;
				}
				if(height !== lastHeight) {
					element.css({
						'max-height': String(height - offset) + 'px'
					});
					if(!!Blockly.mainWorkspace) {
						Blockly.mainWorkspace.render();
					}
				}
				lastHeight = height;
			};
			update();
			angular.element($window).bind('resize', update);
		}
	};
});
