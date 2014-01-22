function BlockGroup(model,parentmodel,column,row)
{
    this.model = model;		// StatementBlock associated with the group
    this.parentmodel = parentmodel;
	this.column = column;	// anchor position for the group
    this.row = row;

    this.head = null;           // GraphicBlock if we represent a procedure
    this.body = [];		// GraphicBlocks in the group
    this.cursor = null;		// Where to append next graphic
    this.domanchor = null;	// Anchor for the blocks

    var that = this;

    this.check = function(label) {
	for (var index in that.body) {
	    if (that.body[index].group !== that) {
		var groupname = 'orphan';
		if (that.model.getName !== undefined) {
		    groupname = that.model.getName();
		}
		throw 'BlockGroup.check('+label+') failed: index = '+
		index+
		' this.model.name:'+
		groupname+
		' graphic.model.name:'+
		that.body[index].model.getName();
	    }
	}
    };
};


BlockGroup.prototype.getCursor = function() {
    return this.cursor;
};

BlockGroup.prototype.detach = function() {
    if (this.body.length !== 0) {
	this.body[0].detach();
	this.body = [];
    }
    if (this.head !== null) {
	this.head.detach();
    }
    this.head = null;
};

BlockGroup.prototype.detachGraphic = function(graphic) {
    for (var index in this.body) {
	if (this.body[index] === graphic) {
	    this.body.splice(index,this.body.length - index);
	    break;
	}
    }

    // If the detached graphic contains our cursor, detach the cursor
    if (this.cursor !== null &&
	graphic.domobject !== null) {

	var cursors = graphic.domobject.find('.cursor');
	for (var index = 0; index < cursors.length; index++) {
	    if ($(cursors[index]).data('cursor') === this.cursor) {
		this.cursor = null;
		break;
	    }
	}
    }

    graphic.detach();
};

BlockGroup.prototype.setDomAnchor = function(domobject) {
    this.domanchor = domobject;
};

BlockGroup.prototype.getDomNext = function() {
    return this.domanchor;
};

BlockGroup.prototype.view = function(diagram,viewcontainer,varlist) {
    this.check('view start');

    var absolute = false;
    if (this.parentmodel === null) {
	absolute = true;
    }

    if (this.model instanceof Procedure) {
	if (this.head === null || this.head.changed(diagram)) {
	    if (this.head !== null) {
		this.detachGraphic(this.head);
	    }
	    var view = diagram.getViewOfModel(this.model);
	    if (view === null || view === undefined) {
		var icon = diagram.tools.lookup(this.model,
						this.model.getName());
		if (icon === null) {
		    console.log('No match found for procedure:',this.model);
		    throw 'No match';
		}
		view = new TemplateBlock(icon);
	    }
	    var template = view.domobject;
	    this.head = new GraphicBlock(this.model,
					 this,
					 this.column,
					 this.row,
					 template);
	    this.head.view(diagram,viewcontainer,absolute,varlist);
	}
	absolute = false;
	viewcontainer = this.head;
    }

    for (var index = 0; index < this.model.blocks.length; index++) {
	var graphic = this.body[index];
	var modelgraphic = diagram.getViewOfModel(this.model.blocks[index]);

	// If the modelgraphic template changed, remove it and re-form
	if (modelgraphic instanceof GraphicBlock &&
	    modelgraphic.changed(diagram)) {
	    if (modelgraphic.group !== null) {
		modelgraphic.group.detachGraphic(modelgraphic);
	    }
	    modelgraphic = null;
	}

	// if model's graphic doesn't exist, find a best match
	if (modelgraphic === null) {
	    var name = '';
	    if (this.model.blocks[index].getName !== undefined) {
		name = this.model.blocks[index].getName();
	    }
	    var bestmatch = diagram.tools.lookup(this.model.blocks[index],
						 name);
	    if (bestmatch === null || bestmatch === undefined) {
		console.log('No match found for:',this.model.blocks[index]);
		throw 'No match';
	    }
	    modelgraphic = new TemplateBlock(bestmatch);
	}

	// if model is a template - convert
	if (modelgraphic instanceof TemplateBlock) {
	    modelgraphic = new GraphicBlock(this.model.blocks[index],
					    this,
					    this.column,
					    this.row,
					    modelgraphic.domobject);
	    diagram.setViewOfModel(this.model.blocks[index],
				   modelgraphic);
	}

	if (graphic !== modelgraphic || graphic.changed(diagram)) {
		// mismatch between model and our view - either new or moved
		if (modelgraphic !== null) {
			if (modelgraphic.group !== null) {
				modelgraphic.group.detachGraphic(modelgraphic);
			}

			if (graphic === undefined) {
				// beyond our list - append
				this.body.push(modelgraphic);
				modelgraphic.group = this;
				graphic = modelgraphic;
			} else {
				// moved in or between lists - remove existing from current list
				this.detachGraphic(graphic);

				this.body.push(modelgraphic);
				modelgraphic.group = this;

				graphic = modelgraphic;
			}
		}
	}
	graphic.view(diagram,viewcontainer,absolute,varlist);
	absolute = false;

	viewcontainer = graphic;
    }

    // chop off detached at the end
    var extra = this.body.length - this.model.blocks.length;
    if (extra < 0) {
	throw 'Internal error: too few graphics extra = ' + extra;
    }
    if (extra > 0) {
	this.body[this.model.blocks.length].detach();
	this.body.splice(this.model.blocks.length, extra);
    }
    // Setup or move cursor as needed
    var newcursorlocation = viewcontainer.getDomNext();
    if (newcursorlocation === null) {
	if (this.cursor !== null) {
	    this.cursor.disableDrop();
	}
	this.cursor = null;
    }
    else if (this.cursor === null ||
	     this.cursor.domobject !== newcursorlocation) {

	if (this.cursor !== null) {
	    this.cursor.disableDrop();
	    this.cursor = null;
	}

	this.cursor = new InsertionPoint(this.model,
					 this,
					 newcursorlocation);
	this.cursor.setupDrop(diagram);

	// Mark the cursor to enable nulling it if we delete it's parent graphic
	// see BlockGroup.detachGraphic()
	this.cursor.domobject.addClass('cursor');
	this.cursor.domobject.data('cursor',this.cursor);

	// Special filter to prevent dragging 'case' statements everywhere
	if (this.model instanceof CaseSeries) {
	    this.cursor.domobject.droppable('option','accept','.case');
	}
	else {
	    this.cursor.domobject.droppable('option','accept',
					    function(drag) {
						return !drag.hasClass('case');
					    });
	}
    }

    this.check('view end');
};

// Delete a block group by deleting:
//		1) this group from the diagram
//		2) this group.model from the editor
//		3) each included block from the diagram content
// BlockGroup.prototype.deleteGroup = function(zrCodeEditor, isProcedure, isPartial, isSubgroup) {
// 	switch (100*isProcedure + 10*isPartial + 1*isSubgroup) {
// 	case 1:
// 		// full subgroups
// 		//console.log('subgroup of conditional or something');
// 		for (var b in this.body) {
// 			this.body[b].deleteBlock(zrCodeEditor);
// 		}
// 		var parent = undefined;
// 		for (var c in zrCodeEditor.diagram.contents) {
// 			if (zrCodeEditor.diagram.contents[c].id === this.parentmodel.id) {
// 				parent = zrCodeEditor.diagram.contents[c];
// 				break;
// 			}
// 		}
// 	  //	 specifically deal with a conditional
// 		if (parent.model instanceof Conditional) {
// 			var cases = [parent.model.falsecase, parent.model.truecase];
// 			for (var c in cases) {
// 				if (cases[c].blocks.length > 0) {
// 					if (cases[c].blocks[0].id === this.body[0].id) {
// 						cases[c].blocks = [];
// 						break;
// 					}
// 				}
// 			}
// 		}
// 	  //	
// 		for (var s in parent.subgroups) {
// 			if (parent.subgroups[s].body.length > 0) {
// 				if (parent.subgroups[s].body[0].id === this.body[0].id) {
// 					parent.subgroups[s].body = [];
// 					break;
// 				}
// 			}
// 		}
// 		break;

// 	case 100:
// 		//console.log('full procedure');
// 		// if this block group is the whole procedure group, then empty the procedure.
// 		for (var b in this.body) {
// 			this.body[b].deleteBlock(zrCodeEditor);
// 		}
// 		zrCodeEditor.diagram.procedureGroup.body = [];
// 		zrCodeEditor.editor.procedure.blocks = [];
// 		break;
	
// 	case 0:
// 		//console.log('full orphan ', this);
// 		// if it's an orphan group, remove it from diagram and the editor.
// 		for (var b in this.body) {
// 			this.body[b].deleteBlock(zrCodeEditor);
// 		}
// 		var diagramOrphans = zrCodeEditor.diagram.orphanGroups;
// 		var editorOrphans = zrCodeEditor.editor.orphans;
// 		for (var o in diagramOrphans) {
// 			if (this === diagramOrphans[o] &&
// 				this.model === editorOrphans[o]) {
// 				diagramOrphans.splice(o, 1);
// 				zrCodeEditor.diagram.orphanGroups = diagramOrphans;
// 				editorOrphans.splice(o, 1);
// 				zrCodeEditor.editor.orphans = editorOrphans;
// 			}
// 		}
// 		break;
		
// 	default:
// 		for (var b in this.body) {
// 			this.body[b].deleteBlock(zrCodeEditor);
// 		}
// 		// for purposes of printing debug statements...
// 		// switch (100*isProcedure + 10*isPartial + 1*isSubgroup) {
// 		// case 10:
// 			// // partial orphan
// 			// console.log('partial orphan ', this);
// 			// break;
			
// 		// case 11:
// 			// // partial subgroup of a conditional, or something
// 			// console.log('partial subgroup of a conditional or something');
// 			// break;
			
// 		// case 110:
// 			// // partial group of the procedure
// 			// console.log('partial procedure ', this);
// 			// break;
// 		// }
// 		break;
// 	}
// }
