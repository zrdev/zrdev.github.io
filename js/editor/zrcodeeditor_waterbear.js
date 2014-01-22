var diagram; // the trashcan is looking for a global variable.
function ZRCodeEditor(){

    CodeEditorWaterbear.prototype.constructor.call(this);

    this.toolboxDef = '<div class="zr-toolbox"/>';
    this.bottomTabListDef =
        '<ul>'
        +'<li><a href="#zr-edit-tab" class="greenBtn"><span class="middle">Editor</span></a></li>'
        +'<li><a href="#zr-ccode-tab" class="greenBtn"><span class="middle">C Code</span></a></li>' +
        //      +'<li><a href="#zr-json-tab">JSON Debug</a></li>' +
        // '<li><button id="saveButton" class="hidden">Save</button></li>'+
        // '<li><button id="restoreButton" class="hidden">Restore</button></li>'+
        '<li><button id="convertButton" class="blueBtn"><span class="middle">Generate Code</span></a></li>'+
	'<li><button id="clearButton" class="redBtn"><span class="middle">Clear All</span></button></li>'+
        // '<li><button id="undoButton" class="hidden">Undo</button></li>'+
        // '<li><button id="redoButton" class="hidden">Redo</button></li>'+
        // '<li><button id="newButton" class="hidden">New Procedure</button></li>'+
        // '<li><button id="editButton" class="hidden">Edit Procedure</button></li>'+
        // '<li><button id="deleteButton" class="hidden">Delete Procedure</button></li>'+
        // '<li><button id="editVar" class="hidden">Edit Global Variable</button></li>'+
        // '<li><button id="deleteVar" class="hidden">Delete Global Variable</button></li>'+
        // '<li><button id="editLocalVar" class="hidden">Edit Local Variable</button></li>'+
        // '<li><button id="deleteLocalVar" class="hidden">Delete Local Variable</button></li>'+
        '</ul>';
    this.protoListDef = '<div class="ui-widget-header" />';
    this.canvasDef =  '<div id="canvas" class="zr-canvas" />';
    this.trashDef =
	'<div id="trash" '
	+'class="wrapper ui-droppable ui-widget-header">'
	+'<div id="trashcan" class="trashcan"></div></div>';
};

ZRCodeEditor.prototype = new CodeEditorWaterbear();

ZRCodeEditor.prototype.constructor = ZRCodeEditor;

ZRCodeEditor.prototype.init = function(options) {
    var that = this;
        
    this.anchor = $('#'+options.anchor);
        
    //Clear out any existing child tags
   	//this.anchor.empty();
    if (!('cByDefault' in options)){
        options.cByDefault = false;
    }
    
    if (!('id' in options)){
        options.id = 'zreditor'
    }
    
    //=== Create the anchor divs for the components of the editor ===//
    var varMenu = $(this.varMenuDef).appendTo(this.anchor);
    $(this.varLblDef).appendTo(varMenu);
    $(this.varNewDef).appendTo(varMenu);
    var msgBox = $(this.varMsgDef).appendTo(varMenu);
    this.msgBox = msgBox;
    this.delmenu=$(this.varRemoveDef).appendTo(varMenu);
    
    // Create tabs at the bottom of the page for viewing either the
    // editor or rendered code
    var bottomTabs = $('<div class="zr-bottom-tabs"/>').appendTo(this.anchor);
    bottomTabs.addClass('ui-tabs-bottom ');
    bottomTabs.append(this.bottomTabListDef);
    var editorTab = $('<div id="zr-edit-tab"/>').appendTo(bottomTabs);
    var protoList = $(this.protoListDef).appendTo(editorTab);
    var canvas = $(this.canvasDef).appendTo(editorTab);

    // trashcan drop-zone for deleting block groups     
    $(canvas).append(this.trashDef);
    $('#trash').droppable({
            greedy: false,
	    tolerance: 'touch',
            scope: 'blocks',
	    over: function() { $('#trashcan').addClass('highlight'); },
	    out: function() { $('#trashcan').removeClass('highlight'); },
            drop: function(event, ui) {
		$('#trashcan').removeClass('highlight');
		$(canvas).removeClass('drophover');
		if (that.diagram !== null) {
		    var drag = $(ui.draggable);
		    var graphicblock = drag.data('graphicblock');
		    if (drag.draggable('option','helper') === 'clone') {
			return; // Don't bother deleting clones
		    }
		    if (graphicblock !== undefined) {
			var model = graphicblock.getModel();
			that.dropCallback(event,
					  {code:"delete"},
					  graphicblock,
					  model);
		    }
		    return;
		}
            }
        });
        
    var ccodeTab = $('<pre id="zr-ccode-tab"/>').appendTo(bottomTabs);
    $(bottomTabs).tabs({
		selected: 0,
		show: function(event, ui) {
			if (ui.index == 1) {
				$(window).resize();
			}
		}
	});
    //$(bottomTabs).addClass("ui-tabs-bottom")
	//.find(".ui-tabs-nav").add($(".ui-tabs-nav > *", $(bottomTabs)))
	//.removeClass("ui-corner-all ui-corner-top")
	//.addClass("ui-corner-bottom");

    //Only add toolbox if sepecified
    if ('toolbox' in options){
        if (options.toolbox){
            var tbx = $(this.toolboxDef).appendTo(this.anchor);
            this.toolbox = new Toolbox();
            this.toolbox.create(tbx);
        }
	if (options.testbuttons){
	    $('#saveButton').removeClass('hidden');
	    $('#restoreButton').removeClass('hidden');
	    $('#clearButton').removeClass('hidden');
	    $('#undoButton').removeClass('hidden');
	    $('#redoButton').removeClass('hidden');
	    $('#newButton').removeClass('hidden');
	    $('#editButton').removeClass('hidden');
	    $('#deleteButton').removeClass('hidden');
	    $('#editVar').removeClass('hidden');
	    $('#deleteVar').removeClass('hidden');
	    $('#editLocalVar').removeClass('hidden');
	    $('#deleteLocalVar').removeClass('hidden');
	}
    }
        
    //Somewhat of a hack to get the tabs at the bottom of the page to
    //appear properly *New* also moves the trashcan
    $(window).resize(function() {
    	if (window.dEditor && window.dEditor.codebody) 
    		window.dEditor.codebody.textEditor.refresh();
            var height =
            $(window).height() - 
            $(bottomTabs).offset().top - 
            ($(bottomTabs).outerHeight(true) - 
             $(bottomTabs).height());

            //      $(bottomTabs).height(Math.max(height,200));
            //      $(".zr-canvas").height($(bottomTabs).height() -
            //                             $(protoList).outerHeight(true)-32);
            $(bottomTabs).height(Math.max(height,400));
            $(".zr-canvas").height($(bottomTabs).height() -
                                   $(protoList).outerHeight(true)-32);
        });
                

    // Save and Restore
    $('#saveButton').click(function () {
            console.log('saved!');
            that.saveCurrentCode();
        });
    $(window).unload(function () {
            that.saveCurrentCode();
        });
        
    $(window).load(function () {
            //that.restoreCode();
        });
        
    $('#restoreButton').click(function () {
            console.log('restored!');
            that.restoreCode();
        });
        
    $('#clearButton').click(function() {
            that.clearCanvas(false);
        });     
        
    $('#undoButton').click(function() {
            that.undo();
        });

    $('#redoButton').click(function() {
            that.redo();
        });

    $('#newButton').click(function() {
            that.newProcedure();
        });

    $('#editButton').click(function() {
            that.editProcedure();
        });

    $('#deleteButton').click(function() {
            that.deleteProcedure();
        });

    $('#editVar').click(function() {
            that.editVariable();
        });

    $('#deleteVar').click(function() {
            that.deleteVariable();
        });

    $('#editLocalVar').click(function() {
            that.editLocalVariable();
        });

    $('#deleteLocalVar').click(function() {
            that.deleteLocalVariable();
        });

    $(window).resize();

    //=== Initialize the editor components===//
    this.tools = new Tools();

    this.diagram = new CodeDiagramWaterbear();
    diagram = this.diagram;
    
    diagram.view(canvas);

	$(bottomTabs).tabs({
		selected: 1
	});
	$(window).resize();
    this.codebody = new CodeC();
    var codebody = this.codebody;
    codebody.view(ccodeTab);

    diagram.tools = this.tools;
	$(bottomTabs).tabs('select', 0);
    this.setLibrary(new CodeLibrary());
};

/* Delete all the blocks in the diagram. */
ZRCodeEditor.prototype.clearCanvas = function(forced) {
    if (forced || confirm('Clear the current diagram and code?')) {
	this.clear();
	localStorage.clear();
    }
};

/* Save the current view of the diagram. */
ZRCodeEditor.prototype.saveCurrentCode = function() {
    var savestate = this.getSaveState();
    localStorage['__current_code'] = JSON.stringify(savestate);
	this.codebody.textEditor.clearHistory();
    this.clearUndo();
    this.clearRedo();
};

/* Restore an older version of the diagram. */
ZRCodeEditor.prototype.restoreCode = function() {
    if (localStorage.__current_code) {
	var restorestate = JSON.parse(localStorage.__current_code);
	this.restoreSaveState(restorestate);
    }
};


ZRCodeEditor.prototype.newProcedure = function(signature) {
    if (signature) {
		if (this.library.lookupVariable(signature) !== null) {
		    alert('Variable exists with the same name: '+signature);
		    return;
		}
		var procedure = new Procedure(signature,'User Function');
		this.addProcedure(procedure);
    }
	// clear the history
	this.codebody.textEditor.clearHistory();
};

ZRCodeEditor.prototype.editProcedure = function(name) {
    if (name) {
		var procedure = this.library.lookupProcedure(name);
		if (procedure !== null) {
		    this.edit(procedure);
		}
    }
};

ZRCodeEditor.prototype.deleteProcedure = function(name) {
    var api = new ZrApiGame();

    if (name) {
	if (name === '*') {
	    this.setLibrary(new CodeLibrary());
	    api.setupApi(this);
	}
	else {
	    var editmain = api.getMain(this);
	    var procedure = this.library.lookupProcedure(name);
	    if (procedure === editmain) {
		alert("Cannot delete main procedure: "+name);
		return;
	    }
	    if (procedure !== null) {
		if (procedure === this.procedure) {
		    this.edit(editmain);
		}
		this.removeProcedure(procedure);
		this.redraw();
	    }
	    else {
		alert(name+' not found');
	    }
	}
    }
};

ZRCodeEditor.prototype.editVariable = function(name, signature) {
    if (name) {
	if (this.library.lookupProcedure(name) !== null) {
	    alert('Procedure exists with the same name: '+name);
	    return;
	}
	var variable = this.library.lookupVariable(name);
	if (variable !== null) {
	    this.library.variables.renameVariable(variable,signature);
	    this.updateTools();
	}
	else {
	    //alert('Creating '+signature);
	    var variable = new Variable(signature);
	    this.addVariable(variable);
	}
	this.redraw();
    }
};

ZRCodeEditor.prototype.deleteVariable = function(name) {
    if (name) {
	var variable = this.library.lookupVariable(name);
	if (variable !== null) {
	    this.removeVariable(variable);
	    this.redraw();
	    if (this.changecb) {
		this.changecb();
	    }
	}
	else {
	    alert(name+' not found');
	}
    }
};

ZRCodeEditor.prototype.editLocalVariable = function() {
    var signature = prompt('Enter Local Variable:');
    if (signature) {
	if (this.library.lookupProcedure(signature) !== null) {
	    alert('Procedure exists with the same name: '+signature);
	    return;
	}
	if (this.library.lookupVariable(signature) !== null) {
	    alert('Global Variable exists with the same name: '+signature);
	    return;
	}
	var variable = this.procedure.lookupLocalVariable(signature);
	console.log(variable);
	if (variable !== null) {
	    variable.setName(signature);
	    this.redraw();
	}
	else {
	    var variable = new Variable(signature);
	    this.addLocalVariable(variable);
	    this.redraw();
	}
    }
};

ZRCodeEditor.prototype.deleteLocalVariable = function() {
    var name = prompt('Enter Local Variable to Delete:');
    if (name) {
	var variable = this.procedure.lookupLocalVariable(name);
	if (variable !== null) {
	    this.removeLocalVariable(variable);
	    this.redraw();
	}
	else {
	    alert(name+' not found');
	}
    }
};
