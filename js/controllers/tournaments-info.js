zr.controller('TournamentsInfoController', function($scope, $route, tournamentResource) {
	$scope.data = {};
	$scope.tournament = tournamentResource.data;
	$scope.data.divisions = [
		{
			id: 1,
			name: 'US'
		},
		{
			id: 2,
			name: 'Russia'
		},
		{
			id: 3,
			name: 'ESA'
		}
	];
	$scope.data.infoPages = [
		{
			id: 1,
			name: 'Overview',
			content: 'The Zero Robotics Italian National Virtual Competition 2013 creates an opportunity for any Italian teams that did not manage to get into the Alliance phase of the ZR High School Tournament 2013 to compete in a national virtual championship against other Italian teams. New teams are welcome to join the championship, even if they did not originally register for the regular Tournament.This special Zero Robotics tournament opens to High School students the same world-class simulation facilities that MIT and NASA use to prepare their research to operate aboard the International Space Station. Students will write programs at their schools which utilize the same simulation software! The goal is to build critical engineering skills for students, such as problem solving, design through process, operations training, and team work.The participants compete to win the same technically challenging game played in the Zero Robotics High School Tournament 2013. The game is motivated by a challenging problem of interest to DARPA, NASA, ESA, and MIT. The programs are "autonomous" - that is, the students cannot control the satellites during the test itself.The special Italian National Virtual Championship consists of one competition, using the game in a 3D virtual environment. During that competition students will have up to 5 weeks to program the satellites and see their progress against the competitors in the simulation. The top three teams will be invited to a national final simulation to be run in Torino live. Note: the Italian National Virtual Championship Finals will not take place aboard the ISS.As with all Zero Robotics games, student teams can create, edit, save and simulate projects online. They may use a graphical block diagram editor or a C editor to write code, then simulate their program immediately and see the results in a flash animation. MIT provides the simulation and C programming interfaces via the Zero Robotics website--no special software is required. The simulation also enables teams to compete against themselves or pre-coded standard players. All submissions to challenge others and to the competition are via the website. Students also have access to online tutorials and an MIT technical support system.Disclaimer: The Italian National Virtual Championship is a pilot program based on the annual Zero Robotics High School Tournament. It is a new program, with active development and new interactions between MIT, PoliTo, and other key players. Therefore, while participants should expect continuous support from within Italy, there might be technical difficulties from time to time.RegistrationTo participate in the Italian National Virtual Competition:',
			isDefault: false
		},
		{
			id: 2,
			name: 'Alliance Stuffs',
			content: '<i>lerfuhwepfoiuherpfuh23rfoegrfoiuehfo</i>',
			isDefault: true
		}
	];
	$scope.data.competitions = [
		{
			id: 1,
			name: '2D Competition'
		},
		{
			id: 2,
			name: '3D Practice'
		}
	];
	
	//Resolve URL params to state
	if($route.current.params.mode !== void 0) {
		$scope.mode = $route.current.params.mode;
	}
	else {
		$scope.mode = 'info';
	}
	if($route.current.params.resourceId !== void 0) {
		$scope.resourceId = parseInt($route.current.params.resourceId);
	}
	else {
		var len = $scope.data.infoPages.length;
		for(var i = 0; i < len; i++) {
			if($scope.data.infoPages[i].isDefault) {
				$scope.resourceId = $scope.data.infoPages[i].id;
				break;
			}
		}
	}
	$scope.setDisplay = function(mode, resourceId) {
		$scope.mode = mode;
		$scope.resourceId = resourceId;
	}
	
	$scope.getInfoPage = function() {
		var len = $scope.data.infoPages.length;
		for(var i = 0; i < len; i++) {
			if($scope.data.infoPages[i].id === $scope.resourceId) {
				return $scope.data.infoPages[i].content;
			}
		}
		return '';
	}
});
