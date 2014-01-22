function CodeEditorWaterbear()
{
    CodeEditor.prototype.constructor.call(this);

    var that = this;

    this.loadExpressionFromDomObject = function(cmd,
						model,
						container,
						domobject,
						viewtag) {

	if (container.model) { container = container.model; }
						
	var operator = domobject
	.find('label')
	.contents()
	.filter(function() { return this.nodeType == 3; }).text();

	operator = operator.replace(/ +/g,'');
	if (cmd.alias !== undefined) {
	    operator = cmd.alias;
	}
	//console.log('Operator:');
	//console.log(operator);

	var children = domobject
	.children('.block')
	.children('.blockhead')
	.children('label')
	.children('.socket, .autosocket, .value');

	var expression = new Expression(operator);
	if (that.library !== null) {
	    var procedure = that.library.lookupProcedure(operator.replace(/\(.*/g,''));
	    expression.setProcedure(procedure);
	}
	container.replaceVariable(model,expression);
	expression.annotate('viewtag',viewtag);

	var exprgroup = new ExprGroup(expression,container,domobject);
	that.setViewOfModel(expression,exprgroup);

	for (var cindex = 0; cindex < children.length; cindex++) {
	    var cobject = $(children[cindex]);
	    //console.log('cobject:');
	    //console.log(cobject);

	    if (cobject.hasClass('socket') ||
		cobject.hasClass('autosocket')) {
		var wrappers = cobject.children('.wrapper');
		if (wrappers.length !== 0) {
		    if (wrappers.length > 1) {
			throw 'Cannot handle mulitple wrappers';
		    }
		    //console.log('  -->wrapper');
		    that.loadExpressionFromDomObject(cmd,
						     expression.variables[cindex],
						     expression,
						     $(wrappers[0]),
						     viewtag);
		}
		else {
		    var variable;
		    var inputs = cobject.children('input');
		    if (inputs.length === 1) {
			//console.log('  -->input');
			variable = new Constant(inputs.val());
			variable.annotate('viewtag',viewtag);
		    }
		    else {
			var select = cobject.children('select');
			if (select.length !== 1) {
			    console.log(select);
			    throw 'Not ready to handle multiple child inputs';
			}
			//console.log('  -->select',select.val());
			var type = 'float';
			if (select.val() === 'true' ||
			    select.val() === 'false') {
			    type = 'bool';
			}
			var definition;
			if (that.library !== undefined &&
				that.library.lookupVariable(select.val())) {
				definition = that.library.lookupVariable(select.val());
			}
			else {
				definition = new Variable(select.val(),type);
				definition.annotate('viewtag',viewtag);
				if (that.library !== undefined) {
					that.library.addVariable(definition);
				}
			}
			variable = new VariableRef(definition);
			//console.log(variable.parseName(select.val()));
		    }
		    expression.addVariable(variable);

		    var exprblock = new ExprBlock(variable,exprgroup);
		    $(children[cindex]).data('exprblock',exprblock);

		    that.setViewOfModel(variable,exprblock);
		}
	    }
	    else if (cobject.hasClass('wrapper')) {
		//console.log('  wrapper');
	    }
	}
    };
};

CodeEditorWaterbear.prototype = new CodeEditor();
CodeEditorWaterbear.prototype.constructor = CodeEditorWaterbear;

CodeEditorWaterbear.prototype.dropCallback = function(event,cmd,view,model) {
    if (cmd.code === 'expr_setexpression') {
	this.loadExpressionFromDomObject(cmd,
					 model,
					 view.getContainerModel(),
					 cmd.template.domobject,
					 cmd.viewtag);
	this.redraw();
	if (this.changecb !== null) {
	    this.changecb();
	}
    } else {
	CodeEditor.prototype.dropCallback.call(this,event,cmd,view,model);
    }
};

CodeEditorWaterbear.prototype.setToolbox = function(toolbox) {
    this.toolbox = toolbox;
};

CodeEditorWaterbear.prototype.getToolbox = function() {
    return this.toolbox;
};


CodeEditorWaterbear.prototype.updateTools = function() {
    this.toolbox.updateTools(this.tools, this.library, this.procedure);
};
