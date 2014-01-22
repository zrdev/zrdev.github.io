function clipInteger(value,minval,maxval) {
    if (minval !== undefined || maxval !== undefined) {
	value = parseInt(value);
    }
    if (minval !== undefined &&
	(value < parseInt(minval) || isNaN(value))) {
	value = minval;
    }
    if (maxval !== undefined &&
	value > parseInt(maxval)) {
	value = maxval;
    }
    return value;
};

function ExprGroup(model,owner,template)
{
    if (!(model instanceof Expression)) {
 	console.log('error:',model);
 	throw 'model passed to ExprGroup not an Expression';
    }

    this.model = model;
    this.owner = owner;
    this.template = template;
    this.domobject = null;
};

ExprGroup.prototype.getViewOfModel = function(diagram,model) {
    var view = diagram.getViewOfModel(model);
    if (view === null) {
	var name = null;
	if (model.definition !== undefined) {
	    model = model.definition;
	    if (!(model instanceof Variable) &&
		!(model instanceof NamedExpression)) {
		console.log('Hmmm:',model);
		throw 'Not a variable or namedexpression';
	    }
	}

	if (model.getName !== undefined) {
	    name = model.getName();
	}
	else if (model.operator !== undefined) {
	    name = model.operator;
	}
	if (name !== null) {
	    var domobject = diagram.tools.lookup(model,name);
	    if (domobject !== null) {
		view = new TemplateBlock(domobject);
	    }
	}
    }
    return view;
};

ExprGroup.prototype.getModel = function() {
    return this.model;
};

ExprGroup.prototype.getContainerModel = function() {
    return this.owner;
};

ExprGroup.prototype.updateDynamicVarChoices = function(domobject,varlist) {
    // Get all selections
    var selects = domobject.find('select');

    for (var selindex = 0; selindex < selects.length; selindex++) {
	var select = $(selects[selindex]);

	// Remove existing local variable definitions
	var options = select.find('.dynamicvar');
	options.detach();

	// Add each local variable or named expression to the pick list
	var curopt = null;
	for (var item in varlist.variables) {
	    // Only add if the variable's cardinality matches the listtype
	    var varcard = varlist.variables[item].getCardinality();
	    var slotcard = $(select).parent().attr('data-card');
	    if ((varcard === '1' && $(select).parent().hasClass('arrays')) ||
		(varcard !== '1' && !$(select).parent().hasClass('arrays')) ||
		(slotcard != undefined && (parseInt(varcard) < parseInt(slotcard)))) {
		// Either container wants arrays and variable isn't one
		// or container doesn't want an array and variable is one
		// or variable's array too small for the argument slot
		continue;
	    }
	    if (!varlist.variables[item].isWriteable() &&
		$(select).parent().hasClass('lvars')) {
		continue;		// Variable must be writeable (left-hand side of assignment)
	    }

	    // If it's already in the list, just mark it and go on to the next one
	    // Lifted from :
	    // http://www.foliotek.com/devblog/ \
	    // jquery-custom-selector-for-selecting-elements-by-exact-text-textequals/
	    $.expr[':'].textEquals = function(a, i, m) {
		return $(a).text().match("^" + m[3] + "$");
	    };

	    var name = varlist.variables[item].getName();
	    var existing =
		select.find('option:[label="'+name+'"],option:textEquals('+name+')');
	    if (existing.length !== 0) {
		existing.addClass('dynamicvar');
		continue;
	    }

	    var type = varlist.variables[item].getType();
	    var label = varlist.variables[item].getLabel();
	    var typeclass = 'type-'+type;
	    var option = '<option label="'
		+name
		+'" value="'
		+label
		+'" class="dynamicvar '+typeclass+'"'+' data-card="'+varcard+'">'
		+name+'</option>';

	    if (curopt === null) {
		curopt = $(option).prependTo(select);
	    }
	    else {
		curopt = $(option).insertAfter(curopt);
	    }
	}

	// Make sure boolean list only has boolean's and visa-versa
	if (domobject.hasClass('boolean')) {
	    select.children('option:not(.type-bool)').remove();
	}
	else {
	    select.children('option:.type-bool').remove();
	}
    }
};

ExprGroup.prototype.view = function(diagram,domreplace,varlist) {
    // TODO: Clean this up significantly - the function is too large and complex
    // and is difficult to maintain. It is currently the source of most of the
    // problems in the program.

    // If we don't have a graphical representation, clone our template
    if (this.domobject === null) {
	this.domobject = this.template.clone(false);
	// Hide selects from cCTP()
	this.domobject.find('select').data('styled',1);
    }
    this.domobject.data('exprgroup',this); // Identify owner of graphic

    // If the current graphic isn't us, replace it with ours
    if (domreplace.data('exprgroup') === null ||
	domreplace.data('exprgroup') !== this) {

	domreplace.replaceWith(this.domobject);
	// Hide selects from cCTP()
	domreplace.find('select').data('styled',1);

	// if we're not the top-level socket, kill the margins
	if (!this.domobject.hasClass('socket')) {
	    this.domobject.css('top',0);
	    this.domobject.css('left',0);
	    this.domobject.css('margin',0);
	    this.domobject.css('position','relative');
	}
    }
    
    var sockets = [];

    // Locate socket slots immediately below our graphic
    if (this.domobject.hasClass('socket') ||
	this.domobject.hasClass('autosocket')) {

	this.updateDynamicVarChoices(this.domobject,varlist);
	sockets.push(this.domobject);
    }
    else {
	sockets = this.domobject
	.children('.block')
	.children('.blockhead')
	.children('label')
	.children('.socket, .autosocket, .value');
    }
    var updates = this.domobject
      .find('.autosocket, .socket')
      .filter('.lvars, .vars, .arrays, .boolean');
    if (updates.length !== 0) {
	this.updateDynamicVarChoices(updates,varlist);
    }

    var limit = this.model.variables.length;

    // Check for mismatch between sockets and number of variables to fill them
    if (sockets.length < this.model.variables.length) {
// 	console.log('sockets:',sockets);
// 	console.log('model:  ',this.model);
// 	console.log('Sockets and variables differ:'
// 		    +sockets.length+' vs '+this.model.variables.length);
	// Assignment to an array kludge
	var kludge = this.domobject
	    .parent('label')
	    .children('.socket, .value');
	sockets.push(kludge[0]);
	this.updateDynamicVarChoices(kludge,varlist);
    }

    // For each socket, update value based on variable or nested expression
    var that = this;

    for (var sindex = 0; sindex < limit; sindex++) {
	var socket = $(sockets[sindex]);
	var variable = this.model.variables[sindex];
// 	console.log('mapping socket to variable:');
// 	console.log(socket);
// 	console.log(variable);

	// Update a constant
	if (variable instanceof Constant) {
	    this.viewConstant(diagram, variable, socket, sindex);
	}
	else if (variable instanceof VariableRef) {
	    this.viewVariableRef(diagram, variable, socket, sindex, varlist);
	}
	else if (variable instanceof Expression) {
	    socket = this.viewExpression(diagram, variable, socket, sindex,
					 sockets, varlist);
	}

	var block = socket.data('exprblock');
	if (block === null || block === undefined) {
	    block = this.getViewOfModel(diagram,variable);
	    if (block instanceof TemplateBlock) {
		// TODO FIXME?
		block = new ExprBlock(variable,this);
		diagram.setViewOfModel(variable,block);
	    }
	    socket.data('exprblock',block);
	}
	if (block === null || block === undefined) {
	    throw 'No graphic for variable:'+variable;
	}
	socket.droppable({greedy: true,
		    tolerance: 'intersect',
		    hoverClass: 'drophover',
		    scope: 'expression',
		    drop: function(event,ui) {
 		    that.handleDrop(event,
				    diagram,$(ui.draggable),
				    $(this).data('exprblock'),
				    varlist);
 		}
	    });
	var sockettypes = '';
	if (socket.hasClass('constant')) {
	    socket.droppable('option','accept','.constant');
	}
	else if (socket.hasClass('number')) {
	    socket.droppable('option','accept','.number');
	}
	else if (socket.hasClass('boolean')) {
	    socket.droppable('option','accept','.boolean');
	    sockettypes = '.boolean';
	}
	else if (socket.hasClass('string')) {
	    socket.droppable('option','accept','.string');
	}
    }
};

ExprGroup.prototype.viewConstant = function(diagram, variable, socket, sindex) {
    var input = socket.children();

    var format = this.getViewOfModel(diagram,variable);
    if (format !== null &&
	format.domobject != undefined &&
	format.domobject !== null) {

	var block = $(input).data('exprblock');
	if (block === undefined ||
	    block === null ||
	    (format.domobject.data('exprblock') !== block)) {

	    $(input).replaceWith(format.domobject);
	    $(input).find('select').data('styled',1);
	    block = format;
	    if (block instanceof TemplateBlock) {
		block = new ExprBlock(variable, this);
		diagram.setViewOfModel(variable, block);
	    }
	    socket.data('exprblock', block);
	    format.domobject.data('exprblock', block);
	    format.domobject.css('top', 0);
	    format.domobject.css('left', 0);
	    format.domobject.css('margin', 0);
	    format.domobject.css('position', 'relative');

	    input = format.domobject.find('input');
	    if ($(input).length === 0) {
		input = format.domobject.find('select');
	    }
	    format = block;
	}
	else if (format instanceof TemplateBlock) {
	    format = new ExprBlock(variable, this);
	    diagram.setViewOfModel(variable, format);
	}
    }
    else {
	format = new ExprBlock(variable, this);
	diagram.setViewOfModel(variable, format);
    }
    // If we're an array, use HTML5 'max' and 'min' to limit
    // assume 1st argument is the array variable and 2nd is the limit
    var maxval;
    var minval;

    if (this.model.operator === '[]' && sindex === 1) {
	maxval = parseInt(this.model.variables[0].getCardinality()) - 1;
	minval = 0;
	$(input).attr('min',minval);
	$(input).attr('max',maxval);
    }

    $(input).data('exprblock',format);
    $(input).unbind('change');

    var value = variable.getValue();

    if (this.model.operator === '[]') {
	// range check, clip if needed
	maxval = $(input).attr('max');
	minval = $(input).attr('min');
	value = clipInteger(value,minval,maxval);
    }
    else if (this.owner.model instanceof RangeIterator) {
	value = parseInt(value);
	if (isNaN(value)) {
	    value = 0;
	}
    }
    $(input).val(value);

    var that = this;

    $(input).click(function (event) {
	// Seems needed to enable single-click to edit behavior
	event.preventDefault();
    });

    $(input).change(function() {
	var value = $(this).val();
	var minval = $(this).attr('min');
	var maxval = $(this).attr('max');
	if (that.model.operator === '[]') {
	    value = clipInteger(value,minval,maxval);
	}
	else if (that.owner.model instanceof RangeIterator) {
	    value = parseInt(value);
	    if (isNaN(value)) {
		value = 0;
	    }
	}

	var cmd = {
	    code: 'expr_changeconstant',
	    arguments: [value]
	};
	var block = $(this).data('exprblock');
	diagram.dropEvent(null,
			  cmd,
			  block,
			  block.model);
    });
};

ExprGroup.prototype.viewVariableRef = function(diagram, variable, socket, sindex, varlist) {
    var input = socket.children();

    // If the variable has a replacable graphic, replace input with the graphic
    var format = this.getViewOfModel(diagram,variable);
    if (format !== null &&
	format.domobject !== undefined &&
	format.domobject !== null) {
	
	if ((!$(socket).hasClass('lvars')) &&
	    ($(input).data('exprblock') === undefined ||
	     $(input).data('exprblock') === null ||
	     (format.domobject.data('exprblock') !==
	      $(input).data('exprblock')))) {

	    // Replace the current graphic with the new one
	    this.updateDynamicVarChoices(format.domobject, varlist);
	    $(input).replaceWith(format.domobject);
	    // Hide selects from cCTP()
	    $(input).find('select').data('styled',1);

	    var block = format;
	    if (block instanceof TemplateBlock) {
		block = new ExprBlock(variable,this);
		diagram.setViewOfModel(variable,block);
	    }
	    socket.data('exprblock',block);
	    format.domobject.data('exprblock',block);
	    format.domobject.css('top',0);
	    format.domobject.css('left',0);
	    format.domobject.css('margin',0);
	    format.domobject.css('position','relative');

	    input = format.domobject.find('select');
	    format = block;
	}
	else if (format instanceof TemplateBlock) {
	    format = new ExprBlock(variable,this);
	    diagram.setViewOfModel(variable,format);
	}
    }
    else {
	format = new ExprBlock(variable,this);
	diagram.setViewOfModel(variable,format);
    }
    if (!$(input).is('select')) {
	input = $(input).find('select');
    }
    $(input).data('exprblock',format);
    $(input).unbind('change');

    var name = variable.getName();
    if (name !== '<uninitialized>') {
	// Check if variable's in/out of scope
	var label = variable.getLabel();
	var inlist = $(input).find('option:[value="'
				   +label+'"]'
				   +'[class!="outofscope"]');
	// Remove all out-of-scope options for now (will re-add if needed)
	$(input).find('option:[class="outofscope"]').remove();
	if (inlist.length === 0) {
	    // Out of scope, create a temporary option
	    var outofscopeopt = '<option '
		+'class="outofscope"'
		+'label="'+name+' (out of scope)"'
		+'value="'+label+'">'
		+name+' (out of scope)'
		+'</option>';

	    if ($(input).find('option:[value="'
			      +label
			      +'"]').length === 0) {
		$(outofscopeopt).appendTo($(input));
	    }
	}
	// Display our current value
	$(input).val(label);
    }

    // Prevent changing focus to variable to the left
    $(input).click(function(event) {
	return false;
    });

    $(input).change(function() {
	var cmd = { code: 'expr_changevariable',
		    label: $(this).val(),
		    arguments: [$(this).val()]
		  };
	var block = $(this).data('exprblock');
	diagram.dropEvent(null,
			  cmd,
			  block,
			  block.model);
    });

    if (name === '<uninitialized>') {
	$(input).change();
    }
};

ExprGroup.prototype.viewExpression = function(diagram, variable, socket, sindex, sockets, varlist) {
    var exprgroup = this.getViewOfModel(diagram,variable);
    if (exprgroup === null) {
	console.log('error:',variable);
	throw 'Lookup failed!';
    }
    if (exprgroup instanceof TemplateBlock) {
	var newgroup = new ExprGroup(variable,
				     this.model,
				     exprgroup.domobject);
	diagram.setViewOfModel(variable,newgroup);
	exprgroup = newgroup;
    }
    exprgroup.view(diagram,$(sockets[sindex]),varlist);
    socket = exprgroup.domobject;
    return socket;
};

ExprGroup.prototype.handleDrop = function(event,diagram,dragged,block,varlist) {
    //console.log('handleDrop');

    var template = dragged.clone(false);
    // Hide selects from cCTP()
    template.find('select').data('styled',1);
    var domobjects = template
    .children('.block')
    .children('.blockhead')
    .children('label')
    .children();

    var value = template
    .find('label')
    .contents()
    .filter(function() { return this.nodeType == 3; }).text();

    if (domobjects.length === 0 && value.replace(/ +/g,'') === '') {
	//console.log('  setting constant');

	// editor - set that.model's value to dragged.text()
	var cmd = jQuery.extend({},dragged.data('menucmd'));
	jQuery.extend(cmd, {
		    code: 'expr_setconstant',
		    label: value,
		    ccode: null,
		    arguments: [value,0],
		    template: new TemplateBlock(template)
		    });
	diagram.dropEvent(event,
			  cmd,
			  block,
			  block.model);
    }
    else if (domobjects.length > 1 || value.replace(/ +/g,'') !== '') {
	// console.log('  setting expression');

	// Sanity check for any empty 'select' statements
	var selects = domobjects.find('select');
	for (var index = 0; index < $(selects).length; index++) {
	    if ($(selects[index]).children('option').length === 0) {
		return;
	    }
	}

	// if length > 1 or we have a non-empty label, we setting up
	// an expression editor - set that.model to an expression with
	// a list of variables and/or subexpressions TBD: Do we parse
	// the subexpressions? Probably have to to update the model to
	// reflect the object being dropped into the expression.
	var variables = domobjects; //.children('.autosocket.socket.wrapper');
	var cmd = jQuery.extend({},dragged.data('menucmd'));
	jQuery.extend(cmd, {
		    code: 'expr_setexpression',
		    label: value,
		    ccode: null,
		    arguments: [value,variables.length],
		    template: new TemplateBlock(template)
		    });
	diagram.dropEvent(event,
			  cmd,
			  block,
			  block.model);
    }
    else {
	if (!(block.model instanceof Variable) &&
	    !(block.model instanceof Constant) &&
	    !(block.model instanceof Expression) &&
	    !(block.model instanceof VariableRef)) {

	    console.log(block);
	    throw 'bad block model:'+block.model;
			
	}
	var domobject = $(domobjects[0]);
	if (domobject.hasClass('autosocket')) {
	    // console.log('  setting autosocket',domobject);
	    if (domobject.hasClass('vars') || domobject.hasClass('lvars')) {
		this.updateDynamicVarChoices(domobject,varlist);
	    }

	    var valueobj = domobject.children('select');
	    if (valueobj.length !== 1) {
		throw 'weird or no select under autosocket';
	    }

	    // Don't let them drop in an empty option list
	    if (valueobj.children('option').length === 0) {
		return;
	    }

	    // editor - set that.model to the referenced variable
	    // changes to variable need to change model's variable
	    var cmd = jQuery.extend({},dragged.data('menucmd'));
	    jQuery.extend(cmd, {
		        code: 'expr_setvariable',
			label: valueobj.val(),
			ccode: null,
			arguments: [valueobj.val()],
			template: new TemplateBlock(template)
			});
	    diagram.dropEvent(event,
			      cmd,
			      block,
			      block.model);
	}
	else if (domobject.hasClass('socket')) {
	    // console.log('  setting socket',domobject,domobject.parent());

	    var inputs = domobject.children('input');
	    var wrappers = domobject.children('.wrapper');
	    if (inputs.length !== 1) {
		inputs = domobject.children('select');
		if (inputs.length !== 1) {
		    throw 'handle complex socket later';
		}
	    }

	    // editor - if this contains an "input", set that.model
	    // to value, with changes on the "input" changing
	    // the model's value

	    // editor -if it contains a "wrapper", then that.model
	    // becomes an expression within the variable list
	    // TBD: do we parse the subexpression?

	    var cmd = jQuery.extend({},dragged.data('menucmd'));
	    jQuery.extend(cmd, {
		        code: 'expr_setconstant',
			label: inputs.val(),
			ccode: null,
			arguments: [inputs.val()],
			template: new TemplateBlock(template)
			});
	    diagram.dropEvent(event,
			      cmd,
			      block,
			      block.model);
	}
	else if (domobject.hasClass('wrapper')) {
	    //console.log('   wrapper:');
	    // editor - set that.model to an expression contained
	    // within the wrapper
	}
	else {
	    //console.log('   unknown:');
	    // not sure what to do here
	}
    }
};
