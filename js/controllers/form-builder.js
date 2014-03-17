zr.controller('FormBuilderController', function($scope, $builder) {
	$builder.addFormObject('base', {
		component: 'textInput',
		label: 'School/District Name',
		description: '',
		placeholder: '',
		required: true,
		editable: false
	});
	$builder.addFormObject('base', {
		component: 'textInput',
		label: 'Address',
		description: '',
		placeholder: '',
		required: true,
		editable: false
	});
	$builder.addFormObject('base', {
		component: 'textInput',
		label: 'City',
		description: '',
		placeholder: '',
		required: true,
		editable: false
	});
	$builder.addFormObject('base', {
		component: 'textInput',
		label: 'Zip Code',
		description: '',
		placeholder: '',
		required: true,
		editable: false
	});
	$builder.addFormObject('base', {
		component: 'textInput',
		label: 'State',
		description: '',
		placeholder: '',
		required: true,
		editable: false
	});
	$builder.addFormObject('base', {
		component: 'textInput',
		label: 'State',
		description: '',
		placeholder: '',
		required: true,
		editable: false
	});
	$builder.addFormObject('base', {
		component: 'select',
		label: 'Country',
		description: '',
		placeholder: '',
		options: ['USA', 'Italy', 'Germany'],
		required: true,
		editable: false
	});
	return $scope.form = $builder.forms['base'];
});
