//Courtesy of https://github.com/angular/angular.js/issues/339

zr.directive('embedSrc', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var current = element;
      scope.$watch(function() { return attrs.embedSrc; }, function () {
        var clone = element
                      .clone()
                      .attr(attrs.att, attrs.embedSrc);
        current.replaceWith(clone);
        current = clone;
      });
    }
  };
});