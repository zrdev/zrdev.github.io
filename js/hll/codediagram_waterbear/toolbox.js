function Toolbox()
{
    this.toolboxClass = 'zr-toolbox';
    this.parent = null;
};

Toolbox.prototype.create = function(parent,tools,library) {

    this.parent = parent;

    // Update the parent as the toolbox
    this.parent.addClass(this.toolboxClass);
    
    this.updateTools(tools,library);
};

Toolbox.prototype.updateTools = function(tools,library,editprocedure) {
    this.tools = tools;
    this.library = library;

    // Add the library's procedures to the tool list
    if (this.library !== undefined) {

	var procedures = this.library.procedures;
	this.tools.resetProcedures();
	for (var index = 0; index < procedures.length; index++) {
	    // Note that any API groups with leading underscores will be hidden
	    this.tools.addProcedure(procedures[index],true);
	}

	var varlist = this.library.variables;
	if (editprocedure != undefined) {
	    varlist = varlist.concat(new VariableList(editprocedure.parameters));
	    if (editprocedure.getReturnType() !== 'void') {
		varlist.addVariable(editprocedure.returns);
	    }
	    varlist = varlist.concat(editprocedure.variables);
	}
	this.tools.resetVariables();
	for (var varname in varlist.variables) {
	    this.tools.addVariable(varlist.variables[varname],true);
	}
    }

    // Setup the tabs based on the API groups in the tool set
    var apigroups = {};
    if (this.tools !== undefined) {
	jQuery.extend(apigroups,apigroups,this.tools.getApiGroups());
    }

    for (var group in apigroups) {
	var groupid = group.toLowerCase().replace(/ /,'');
	this.addTab('tab-'+groupid,group,apigroups[group]);
    }

    if (editprocedure != undefined) {
	this.tools.editProcedure(editprocedure);
    }

    // Render the tools
    if (this.tools !== undefined) {
	this.tools.render();
    }
    
    // Reinitialize accordion
    this.parent.accordion("destroy");

    var accordion = this.parent;
    this.parent.accordion({
	collapsible:true, 
	active: false,
	autoHeight: false,
	fillSpace: true,
	create: function(evnet,ui) {
	    $(accordion).removeClass('accordion-active');
	},
	changestart: function(event, ui) {
	    if ($(ui.newHeader).size() != 0) {
		$(ui.newHeader).parent().addClass('accordion-active');
		$(ui.newHeader).parent().accordion("resize");
	    }
	    else {
		$(ui.oldHeader).parent().removeClass('accordion-active');
	    }
	},
	change: function(event, ui) {
	    if ($(ui.newHeader).size() != 0) {
		$(ui.newHeader).parent().accordion("resize");
	    }
	}
    });

    // Make the tools draggable
    this.setupDrag();
};


Toolbox.prototype.setupDrag = function() {
    $('.draggable').draggable({
	    helper: 'clone',
	    appendTo: 'body',
	    opacity: 0.7
	});

    // Limit scope - boolean's, numbers and strings are for expressions only
    $('.draggable.boolean').draggable('option','scope','expression');
    $('.draggable.number').draggable('option','scope','expression');
    $('.draggable.string').draggable('option','scope','expression');

    // whereas steps are for blocks only
    $('.draggable.step').draggable('option','scope','blocks');
};

Toolbox.prototype.addTab = function(id, title, coreid) {
    // If not already defined, add the tab
    if ($('#content_'+id).length === 0) {
	var hidden = '';
	if (coreid !== undefined &&
	    coreid.replace('tab-','')[0] === '_') {
	    hidden = ' style="display: none"';
	}
	var tabstr = '<h3 id="header_' +id+'" '+hidden+'><a href="' + id + '">'
	+ title + '</a></h3>'
	+ '<div id="content_' + id + '"></div>';

	this.parent.append(tabstr)
    }
};
