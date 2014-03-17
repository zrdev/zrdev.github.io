zr.controller('AnnouncementsController', function($scope, $routeParams) {
	$scope.data = {};
	$scope.data.announcements = [
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 2',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 3',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 4',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 5',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 6',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 7',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 8',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 9',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 10',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 11',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 12',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
		{
			id: 1,
			title: 'Announcement 1',
			date: 1391761481198,
			user: 'Ethan DiNinno',
			content: '<i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i><i>SOme announcement content</i>'
		},
		{
			id: 2,
			title: 'Announcement 2',
			date: 391761481198,
			user: 'Alvar Saenz-Otero',
			content: 'SOme other announcement content'
		},
	];
	$scope.data.announcement = null;
	var len = $scope.data.announcements.length;
	var announcementId = parseInt($routeParams['announcementId']);
	for(var i = 0; i < len; i++) {
		if ($scope.data.announcements[i].id === announcementId) {
			$scope.data.announcement = $scope.data.announcements[i];
			break;
		}
	}
	$scope.data.currentPage = 1;
});
