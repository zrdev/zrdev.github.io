//Adjusts the height of components to fit in the window

zr.directive('adjustheight', function($window) {
	return {
		link: function(scope, element, attrs) {
			var offset = parseInt(attrs.adjustheight);
			var update = function() {
				element.css({
					'max-height': String(window.innerHeight - offset) + 'px'
				});
			};
			update();
			angular.element($window).bind('resize', update);
		}
	};
});
