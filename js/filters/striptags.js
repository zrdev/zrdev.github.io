zr.filter('striptags', function() {
	return function(text) {
		return String(text).replace(/<[^>]+>/gm, '');
	};
});
