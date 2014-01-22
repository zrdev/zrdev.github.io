function CodeDiagramWaterbear(tools)
{
    CodeDiagram.prototype.constructor.call(this);

    this.model = null;
    this.type = 'canvas';
    this.contents = [];
    this.tools = tools;

    this.domobject = null;	// DOM object diagram is rendered into

    this.procedureGroup = null;	// Main procedure rendering
    this.orphanGroups = [];     // Orphaned code fragment rendering
    this.default_row = 70;
    this.default_column = 30;
};

CodeDiagramWaterbear.prototype = new CodeDiagram();
CodeDiagramWaterbear.prototype.constructor = CodeDiagramWaterbear;

CodeDiagramWaterbear.prototype.getDomNext = function() {
    return this.domobject;
};

CodeDiagramWaterbear.prototype.view = function (domobject) {
    this.domobject = $(domobject);

    var that = this;

    this.domobject.click(function(event) {
	    event.stopPropagation();
	    diagram.click(event,
			  null,
			  null);
	});

    this.domobject.droppable({
	    //greedy: true,
	    tolerance: 'touch',
	    hoverClass:'drophover',
	    scope: 'blocks',

	    drop: function(event,ui) {
		var dropzone = $(this);
		var left = ui.offset.left - dropzone.offset().left;
		var top = ui.offset.top - dropzone.offset().top;
		var drag = $(ui.draggable);

		var graphicblock = drag.data('graphicblock');
		
		if (left < 0) {
		    left = 0;
		    drag.css('left',left);
		}
		if (top < 0) {
		    top = 0;
		    drag.css('top',top);
		}

		// Dragged an already defined block directly onto canvas
		if (graphicblock !== undefined) {
		    var clone = drag.draggable('option','helper') === 'clone';
		    if (clone === true) {
			that.column = left;
			that.row = top;
		    
			that.dropEvent(event,
				       {code:'clone'},
				       graphicblock,
				       graphicblock.model);
		    }
		    else {
			graphicblock.row = top;
			graphicblock.column = left;

			that.column = left;
			that.row = top;
		    
			graphicblock.model.annotate('row',top);
			graphicblock.model.annotate('column',left);

			if (graphicblock.isDetached(this) === false) {
			    // Remove the model from the parent container
			    that.dropEvent(event,
					   {code:'detach'},
					   graphicblock,
					   graphicblock.model);
			}
		    }
		}
		else {
		    // Sanity check the new block
		    var selects = drag.find('select');
		    if (selects.length !== 0 &&
			selects.children('option').length === 0) {
			return;
		    }

		    // Menu command
		    if (drag.hasClass('case')) {
			return;	// Don't drop case statements at procedure end
		    }
		    // Gather text in icon and remove spaces
		    var value = drag
			.find('label')
			.contents()
			.filter(function() {
				return this.nodeType == 3; }).text();
		    value = value.replace(/ */g,''); // Remove spaces

		    var cmd = jQuery.extend(cmd,{},drag.data('menucmd'));
		    jQuery.extend(cmd, {
			        code: drag.data('menucmd').code,
				label: value,
				ccode: null,
				arguments: [],
				template: new TemplateBlock(drag)
				});
		    var cursor = that.procedureGroup.getCursor();
		    if (cursor !== null) {
			that.dropEvent(event,
				       cmd,
				       cursor,
				       that.procedureGroup.model);
		    }
		}
	    }
	});
};

CodeDiagramWaterbear.prototype.getModel = function() {
    return this.model;
};

CodeDiagramWaterbear.prototype.getContainerModel = function(nest) {
    return this.model;
};

// Getter-Setter for Contents
CodeDiagramWaterbear.prototype.getContents = function() {
	return this.contents;
};

CodeDiagramWaterbear.prototype.setContents = function(newContents) {
	this.contents = newContents;
};

CodeDiagramWaterbear.prototype.draw = function (procedure,fragments,library) {

    if (this.procedureGroup === null ||
	this.procedureGroup.model !== procedure) {

	if (this.procedureGroup !== null) {
	    this.procedureGroup.detach();
	    this.procedureGroup = null;
	}
	var row = procedure.getAnnotation('row');
	var column = procedure.getAnnotation('column');
	if (row === undefined) {
	    row = this.default_row;
	}
	if (column === undefined) {
	    column = this.default_column;
	}
	this.procedureGroup = new BlockGroup(procedure,
					     null,
					     column,
					     row);
	this.procedureGroup.setDomAnchor(this.domobject);
	var view = new TemplateBlock(this.tools.lookup(procedure,
						       procedure.getName()));
	//console.log('procedure view:',view.domobject);
	this.setViewOfModel(procedure,view);
    }

    var varlist = new VariableList(procedure.parameters);
    if (procedure.getReturnType() !== 'void') {
	varlist.addVariable(procedure.returns);
    }

    if (library !== undefined) {
	varlist = varlist.concat(library.variables);
    }

    this.procedureGroup.view(this,
			     this.procedureGroup,
			     varlist);

    if (fragments !== undefined) {
	for (var index = 0; index < fragments.length; index++) {
	    var orphan = this.orphanGroups[index];
	    var row = fragments[index].getAnnotation('row');
	    var column = fragments[index].getAnnotation('column');
	    if (row === undefined) {
		row = this.default_row;
	    }
	    if (column === undefined) {
		column = this.default_column;
	    }
	    if (orphan === undefined) {
		orphan = new BlockGroup(fragments[index],
					null,
					column,
					row);
		orphan.setDomAnchor(this.domobject);
		this.orphanGroups.push(orphan);
		this.setViewOfModel(fragments[index],orphan);
	    }
	    else if (orphan.model !== fragments[index]) {
		orphan.detach();
		orphan = new BlockGroup(fragments[index],
					null,
					column,
					row);
		orphan.setDomAnchor(this.domobject);
		this.orphanGroups[index] = orphan;
		this.setViewOfModel(fragments[index],orphan);
	    }
		
	    orphan.view(this,orphan,[]);
	}
	var extra = this.orphanGroups.length - fragments.length;
	if (extra > 0) {
	    for (var index = fragments.length;
		 index < this.orphanGroups.length;
		 index++) {

		this.orphanGroups[index].detach();
	    }
	    this.orphanGroups.splice(fragments.length,extra);
	}
    }
    else if (this.orphanGroups.length !== 0) {
	for (var index = 0; index < this.orphanGroups.length; index++) {
	    this.orphanGroups[index].detach();
	}
	this.orphanGroups = [];
    }
    this.positionComments();
};

CodeDiagramWaterbear.prototype.highlight = function (view) {
    if (view !== undefined && view.domobject !== undefined) {
	view.domobject.addClass('highlight');
	view.domobject.find('.slot').siblings().addClass('highlight');
    }
};

CodeDiagramWaterbear.prototype.unhighlight = function (view) {
    this.domobject.find('.highlight').removeClass('highlight');
};

CodeDiagramWaterbear.prototype.positionComments = function(view) {
    var arrows = $(this.domobject).find('.zr-comment-arrow');
    for (var index = 0; index < arrows.length; index++) {
	var offset = $(arrows[index]).offset();
	var container = $(arrows[index]).parents('.wrapper');
	container = $(container).filter(":last");
	offset.top = $(arrows[index]).parents('.block').offset().top + 4;
	offset.left = $(container).offset().left + $(container).innerWidth() - 20;
	$(arrows[index]).offset(offset);
    }

    var comments = $(this.domobject).find('.zr-comment');
    for (var index = 0; index < comments.length; index++) {
	var offset = $(comments[index]).offset();
	var container = $(comments[index]).parents('.wrapper');
	container = $(container).filter(":last");

	offset.top = $(comments[index]).parents('.block').offset().top;
	offset.left = 10 +
	    $(container).offset().left +
	    $(container).outerWidth();
	$(comments[index]).offset(offset);
    }
};
