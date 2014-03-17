//Adjusts the height of components to fit in the window

zr.directive('adjustheight', function($window) {
	return {
		link: function(scope, element, attrs) {
			var offset = parseInt(attrs.adjustheight);
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
				element.css({
					'max-height': String(height - offset) + 'px'
				});
			};
			update();
			angular.element($window).bind('resize', update);
		}
	};
});
