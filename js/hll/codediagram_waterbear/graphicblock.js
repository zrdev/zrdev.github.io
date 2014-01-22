function GraphicBlock(model,group,column,row,template)
{
    if (template === undefined || template === null) {
	throw 'GraphicBlock undefined template';
    }
    // TODO: Setup and register expression templates based
    // on the instance's template (or maybe do this below
    // in the .view() method?

    this.model = model;		// HLL model associated with the block
    this.group = group;		// BlockGroup containing this
    this.column = column;	// ??? initial pixels from left edge of canvas
    this.row = row;		// ??? initial pixels down from top of canvas
    this.template = template;	// DOM object template for the block

    this.domobject = null;	// ??? DOM object being rendered for the block
    this.domcomment = null;	// DOM object containing the comment for the block

    this.viewcontainer = null;	// Current attachment

    this.registered = false;	// rendered in the diagram
    this.type = 'block';	// type of object

    this.cursor = null;		// Where to append to
    this.detached = true;	// Not attached to a procedure

    this.expressions = [];	// Conditional/Switch/Loop/Assignment/Call Expressions
    this.subgroups = [];        // Conditional,Switch/Case,Loop BlockGroups

    var sockets = this.getDomSockets();

    this.id = ('B'+Math.random()*110000).substr(0, 5);
    this.model.id = this.id;
	
    if (model instanceof Conditional) {
	this.expressions.push(new ExprGroup(model.test,this,$($(sockets)[0])));
	this.subgroups.push(new BlockGroup(model.truecase,model,column,row));
	this.subgroups.push(new BlockGroup(model.falsecase,model,column,row));
    }
    else if (model instanceof Call) {
	if ($(sockets).length !== model.arguments.length) {
	    // Procedure definition may have changed - update Call()
	    // KLUDGE: This should probably be done in the editor
	    // through a deep recursion through the model on the changeProcedure
	    // call.
	    model.setProcedure(model.procedure);

	    if ($(sockets).length !== model.arguments.length) {
		console.log('Argument length mismatch:',model,$(sockets));
		//throw 'Argument length mismatch';
		return;
	    }
	}
	for (var sindex = 0; sindex < $(sockets).length; sindex++) {
	    this.expressions.push(new ExprGroup(model.arguments[sindex],
						this,
						$($(sockets)[sindex])));
	}
    }
    else if (model instanceof Assignment) {
	var expected = 2;
	if (model.variable.variables[0].operator == '[]') {
	    expected = 3;
	}
	if ($(sockets).length !== expected) {
	    console.log('Assignment socket length:',
			model,
			this.template,
			$(sockets));
	    throw 'Assignment socket length mismatch';
	}
	var sindex = 0;
	if (expected === 2) {
	    this.expressions.push(new ExprGroup(model.variable,
						this,
						$(sockets[sindex++])));
	    this.expressions.push(new ExprGroup(model.expression,
						this,
						$(sockets[sindex++])));
	}
	else {
	    this.expressions.push(new ExprGroup(model.variable.variables[0],
						this,
						$(sockets[sindex++])));
	    // Dummy for the index variable
	    this.expressions.push(null);
	    sindex++;
 	    this.expressions.push(new ExprGroup(model.expression,
 						this,
 						$(sockets[sindex++])));
	}
    }
    else if (model instanceof ArrayIterator) {
	this.expressions.push(new ExprGroup(model.arrayexpr,
					    this,
					    $(sockets[0])));
	this.subgroups.push(new BlockGroup(model.body,model,column,row));
    }
    else if (model instanceof RangeIterator) {
	this.expressions.push(new ExprGroup(model.startexpr,
					    this,
					    $(sockets[0])));
	this.expressions.push(new ExprGroup(model.endexpr,
					    this,
					    $(sockets[1])));
	this.subgroups.push(new BlockGroup(model.body,model,column,row));
    }
    else if (model instanceof SwitchBlock) {
	this.expressions.push(new ExprGroup(model.selectexpr,
					    this,
					    $(sockets[0])));
	this.subgroups.push(new BlockGroup(model.cases,model,column,row));
	this.subgroups.push(new BlockGroup(model.defaultcase,model,column,row));
    }
    else if (model instanceof CaseBlock) {
 	this.expressions.push(new ExprGroup(model.valueexpr,
					    this,
 					    $(sockets[0])));
 	this.subgroups.push(new BlockGroup(model.body,model,column,row));
    }
};

GraphicBlock.prototype.register = function(diagram) {
    if (this.registered === false) {
	this.registered = true;
	diagram.contents.push(this);
    }
};

GraphicBlock.prototype.unregister = function(diagram) {
	var contents = diagram.getContents();
    if (this.registered === true) {
	for (var index in contents) {
	    if (this.id === contents[index].id) {
			contents.splice(index, 1);
			diagram.setContents(contents);
	    }
	}
    }
};

GraphicBlock.prototype.getModel = function() {
    return this.model;
};

GraphicBlock.prototype.getContainerModel = function(nest) {
    if (nest !== undefined && nest !== 0) {
	throw "GraphicBlock.getContainerModel doesn't support non-zero nest";
    }
    if (this.group === undefined ||
	this.group === null) {
	throw "GraphicBlock.getContainerModel group is null or undefined";
    }
    return this.group.model;
};

GraphicBlock.prototype.makeDraggable = function(diagram) {
    var scopestr = 'blocks';
    if (this.model instanceof Procedure) {
	scopestr = 'procblocks';
    }

    var that = this;

    this.domobject.mousedown(function(event) {
	    $(this).draggable('option','helper',
			      (event.shiftKey === true) ? 'clone':'original');
	});

    this.domobject.click(function(event) {
	    var graphicblock = $(this).data('graphicblock');
	    event.stopPropagation();
	    diagram.click(event,
			  graphicblock,
			  graphicblock.model);
	});

    this.domobject.draggable({ helper: 'original',
			       appendTo: 'body',
			       opacity: 0.7,
		               containment: [0,0],
			       scope: scopestr,

			       start: function(event,ui) {
		var nesteddrops = $(this).find('.ui-droppable');
		for (var index = 0; index < nesteddrops.length; index++) {
		    $(nesteddrops[index]).droppable('disable');
		}
	    },
			       stop: function(event,ui) {
		var nesteddrops = $(this).find('.ui-droppable');
		for (var index = 0; index < nesteddrops.length; index++) {
		    $(nesteddrops[index]).droppable('enable');
		}
	    }});
};

GraphicBlock.prototype.getDomNext = function() {
    var nextlist = this.domobject.find('.next');
    if (nextlist.length === 0) {
	nextlist = this.domobject.find('.slot').parent();
    }
    var domnext = null;

    if (nextlist.length !== 0) {
	domnext = $(nextlist[nextlist.length - 1]);
    }
    return domnext;
};

GraphicBlock.prototype.getDomContainers = function() {
    var blocks = this.domobject.children('.block');
    var containlist = blocks.children('.contained');
    var domcontainers = [];

    if (containlist.length !== 0) {
	for (var index = 0; index < $(containlist).length; index++) {
	    domcontainers.push($(containlist[index]));
	}
    }
    return domcontainers;
};

GraphicBlock.prototype.getDomSockets = function() {
    var domobject = this.domobject;

    if (domobject === null) {
	domobject = this.template;
    }
    var socketlist = domobject
    .children('.block')
    .children('.blockhead')
    .children('label')
    .children('.socket, .autosocket, .value');

    var domsockets = [];

    if (socketlist.length !== 0) {
	domsockets = $(socketlist);
    }
    return domsockets;
};

GraphicBlock.prototype.isDetached = function(diagram) {
    return this.detached;
};

GraphicBlock.prototype.changed = function(diagram) {
    var result = false;
    if (this.model.getName !== undefined) {
	var template = diagram.tools.lookup(this.model,this.model.getName());
	if (template == null || template.html() !== this.template.html()) {
	    result = true;
	}
    }
    return result;
};

GraphicBlock.prototype.view = function(diagram,viewcontainer,absolute,varlist) {

    // Create graphic object if needed
    if (this.domobject === null) {
 	this.domobject = this.template.clone(false);
	// Hide selects from cCTP()
	this.domobject.find('select').data('styled',1);
	this.domobject.data('graphicblock',this);
	this.domobject.attr('id', this.id);

	var next = viewcontainer.getDomNext();
	if (next === null) {
	    return;
	}

	next.append(this.domobject);
	this.viewcontainer = viewcontainer;

  	this.makeDraggable(diagram);

	// TODO: Setup and register expression templates based
	// on the instance's template (or maybe do this from
	// the constructor)?
	//this.setupSockets(diagram);

	diagram.setViewOfModel(this.model,this);
    }
    else if (viewcontainer !== this.viewcontainer) {
	this.domobject.detach();
	var next = viewcontainer.getDomNext();
	if (next === null) {
	    return;
	}
	next.append(this.domobject);
	this.viewcontainer = viewcontainer;
    }

    // Position absolutely if free on a diagram, relatively if attached
    if (absolute === true) {
	// position relative to the diagram
	this.domobject.css('position','absolute');
	this.domobject.css('top',this.row);
	this.domobject.css('left',this.column);
	this.detached = true;
    }
    else {
	// zero positioning to parent's drop area
	this.domobject.css('position','relative');
	this.domobject.css('top',0);
	this.domobject.css('left',0);
	this.detached = false;
    }

    //remove margins when blocks are placed in the workspace
    this.domobject.css('margin', 0);

    var sockets = this.getDomSockets();
    for (var sindex = 0; sindex < this.expressions.length; sindex++) {
	if (this.expressions[sindex] !== null) {
	    this.expressions[sindex].view(diagram,
					  $(sockets[sindex]),
					  varlist);
	}
    }

    // View containers within the object
    var containers = this.getDomContainers();
    if (containers.length > this.subgroups.length) {
	if (!this.model instanceof Procedure) {
	    throw 'GraphicBlock.view: containers exceed model:' +
		this.model.getName() + ' ' +
		containers.length + ' > ' + this.subgroups.length;
	}
	else {
	    containers = [];
	}
    }

    // Extend local variable list as we descend the viewing tree
    if ((this.model instanceof ArrayIterator) ||
	(this.model instanceof RangeIterator)) {
	
	varlist = varlist.concat(this.model.body.variables);
    }

    for (var cindex = 0; cindex < containers.length; cindex++) {
	this.subgroups[cindex].setDomAnchor($(containers[cindex]));
	diagram.setViewOfModel(this.subgroups[cindex].model,
			       this.subgroups[cindex]);
	this.subgroups[cindex].view(diagram,
				    this.subgroups[cindex],
				    varlist);
    }

    this.viewComment(diagram);

    if (this.registered === false) {
		this.register(diagram);
    }
};


GraphicBlock.prototype.viewComment = function(diagram) {
    if (this.domobject !== undefined &&
	this.domobject !== null &&
	this.model !== undefined &&
	this.model.annotate !== undefined) {

	var blockhead = $(this.domobject).children('.block').children('.blockhead').first();
	if (this.domcomment == null) {
	    this.domcommentarrow =
		$('<div class="zr-comment-arrow">'
		  +'<div class="ui-icon ui-icon-triangle-1-e"></div>'
		  +'</div>')
		.appendTo(blockhead);

	    $(this.domcommentarrow).click(function(event) {
		var arrow = $(this).children().first();
		var next = $(this).next();
		if ($(arrow).hasClass('ui-icon-triangle-1-s')) {
		    $(arrow).removeClass('ui-icon-triangle-1-s');
		    $(arrow).addClass('ui-icon-triangle-1-e');
		    $(next).show();
		}
		else {
		    $(arrow).removeClass('ui-icon-triangle-1-e');
		    $(arrow).addClass('ui-icon-triangle-1-s');
		    $(next).hide();
		}
		event.stopPropagation();
	    });

	    $(this.domcommentarrow).dblclick(function(event) {
		var arrow = $(this).children().first();
		var next = $(this).next();
		if ($(arrow).hasClass('ui-icon-triangle-1-s')) {
		    $('.zr-comment-arrow').children().removeClass('ui-icon-triangle-1-s');
		    $('.zr-comment-arrow').children().addClass('ui-icon-triangle-1-e');
		    $('.zr-comment-arrow').next().show();
		}
		else {
		    $('.zr-comment-arrow').children().removeClass('ui-icon-triangle-1-e');
		    $('.zr-comment-arrow').children().addClass('ui-icon-triangle-1-s');
		    $('.zr-comment-arrow').next().hide();
		}
		event.stopPropagation();
	    });

	    this.domcomment =
		$('<div class="zr-comment">'
		  +'<textarea></textarea>'
		  +'</div>').appendTo(blockhead);

	    var that = this;
	    var textareas = $(this.domcomment).children('textarea');
	    $(textareas[0]).change(function() {
		if (that.model !== undefined) {
		    diagram.cmdEvent({ code:'comment',
				       model: that.model,
				       comment: $(this).val(),
				       skipredraw: false
				     });
		}
	    });
	}

	var comment = null;
	if (this.model.getAnnotation !== undefined) {
	    comment = this.model.getAnnotation('comment');
	}
	if (comment == undefined || comment == null) {
	    comment = '';
	}
	$(this.domcomment).children('textarea').val(comment);
    }
};

GraphicBlock.prototype.detach = function() {
    if (this.domobject !== null) {
	this.domobject.detach();
    }
    this.viewcontainer = null;
    this.detached = true;
};

// Remove block from the Code Diagram contents
GraphicBlock.prototype.deleteBlock = function(zrCodeEditor) {
    var diagram = zrCodeEditor.diagram;
    if (this.subgroups.length > 0) {
	for (var s in this.subgroups) {
	    this.subgroups[s].deleteGroup(zrCodeEditor, false, false, true);
	}
    }
    for (var b in diagram.getContents()) {
	if (diagram.getContents()[b].id === this.id) {
	    diagram.getContents()[b].unregister(diagram);
	    break;
	}
    }
};
