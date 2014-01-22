function CodeEditor()
{
    this.diagrams = [];
    this.procedure = null;

    this.library = null;

    this.history = [];
    this.copybuffer = [];

    this.viewselected = [];
    this.orphans = [];

    this.undostack = [];
    this.redostack = [];
    this.skippushstate = false;

    this.changecb = null;

    // Private functions
    var that = this;

    this.redraw = function() {
	for (var dindex = 0; dindex < this.diagrams.length; dindex++) {
	    if (that.diagrams[dindex].draw !== undefined) {
		that.diagrams[dindex].draw(that.procedure,
					   that.orphans,
					   that.library);
	    }
	}
    };

    this.setViewOfModel = function(model,view) {
	if (model !== undefined && view !== undefined) {
	    for (var dindex = 0; dindex < this.diagrams.length; dindex++) {
		if (that.diagrams[dindex].setViewOfModel !== undefined) {
		    that.diagrams[dindex].setViewOfModel(model,view);
		}
	    }
	}
    };

    this.updateCallReferences = function(container) {
	if (container === undefined) {
	    // Update all calls in the library
	    for (var index = 0;
		 index < this.library.procedures.length;
		 index++) {
		this.updateCallReferences(this.library.procedures[index]);
	    }
	    // Update all calls in our orphans
	    for (var index = 0;
		 index < this.orphans.length;
		 index++) {
		this.updateCallReferences(this.orphans[index]);
	    }
	} else if (container.getBodyList !== undefined) {
	    // Get the bodies from the passed container
	    var bodylist = [];
	    bodylist = container.getBodyList();

	    // For each body (conditionals,iterators,etc)...
	    for (var bindex = 0; bindex < bodylist.length; bindex++) {
		var body = bodylist[bindex];
		var blocks = body.blocks;
		
		// For each block in the body...
		for (var index = 0; index < blocks.length; index++) {

		    // If it's a call...
		    if (blocks[index] instanceof Call) {

			var call = blocks[index];
			var procname = call.procedure.name;
			var procedure = this.library.lookupProcedure(procname);
			
			// Either remove the call if the procedure
			// is no longer in the library or became a function
			// (only used in expressions), or update
			// any changes to the signature

			if (procedure === null ||
			    (procedure.returns !== null &&
			     procedure.returns.getType() != 'void')) {

			    body.removeSingleCodeBlock(blocks[index]);
			    index--;
			} else {
			    blocks[index].setProcedure(procedure);
			    //this.updateExpressionReferences(blocks[index]);
			}
		    }
		    else if (blocks[index] instanceof Assignment) {
			//this.updateExpressionReferences(blocks[index]);
			this.updateCallReferences(blocks[index]);
		    }
		    else {
			// Not a call, recurse...
			this.updateCallReferences(blocks[index]);
		    }
		}
	    }
	}
    };

    this.invalidFunctionCall = function(container) {
	var result = false;
	if (container instanceof Expression) {
	    if (container.isFunction()) {
		var procname = container.functionName();
		var procedure = this.library.lookupProcedure(procname);

		if ((procedure !== null) &&
		    ((procedure.returns == null) ||
		     (procedure.returns.getType() == 'void'))) {

		    result = true;
		}
	    }
	}
	return result;
    };

    this.updateExpressionReferences = function(container) {
	if (container === undefined || container === null) {
	    return;
	}
	if (container instanceof Call) {
	    for (var arg in container.arguments) {
		if (this.invalidFunctionCall(container.arguments[arg])) {
		    container.arguments[arg] = new Constant(0);
		}
		else {
		    this.updateExpressionReferences(container.arguments[arg]);
		}
	    }
	}
	else if (container instanceof Assignment) {
	    this.updateExpressionReferences(container.variable);
	    this.updateExpressionReferences(container.expression);
	}
	else if (container instanceof Expression) {
	    for (var arg in container.variables) {
		if (this.invalidFunctionCall(container.variables[arg])) {
		    container.variables[arg] = new Constant(0);
		}
		else {
		    this.updateExpressionReferences(container.variables[arg]);
		}
	    }
	}
    };

    this.updateIteratorVariables = function(container,nestdepth) {
	//console.log('updateIterator:',container.constructor.name);
	if (container.updateVariables !== undefined) {
	    container.updateVariables(nestdepth);
	}
	if (container instanceof ArrayIterator ||
	    container instanceof RangeIterator) {
	    this.updateIteratorVariables(container.body,nestdepth+1);
	}
	else if (container instanceof Conditional) {
	    this.updateIteratorVariables(container.truecase,nestdepth);
	    this.updateIteratorVariables(container.falsecase,nestdepth);
	}
	else if (container instanceof SwitchBlock) {
	    this.updateIteratorVariables(container.cases,nestdepth);
	    this.updateIteratorVariables(container.defaultcase,nestdepth);
	}
	else if (container instanceof CaseBlock) {
	    this.updateIteratorVariables(container.body,nestdepth);
	}
	else if (container instanceof StatementBlock) {
	    for (var index = 0; index < container.blocks.length; index++) {
		this.updateIteratorVariables(container.blocks[index],
					     nestdepth);
	    }
	}
    };

    this.findIterationDepth = function(container,node,depth) {
	// TODO: If needed, develope a depth-cache to speed up
	// the searches.

	if (container !== node) {
	    if (container instanceof ArrayIterator ||
		container instanceof RangeIterator) {

		depth = this.findIterationDepth(container.body,
						node,
						depth+1);
	    }
	    else if (container instanceof Conditional) {
		depth = this.findIterationDepth(container.truecase,
						node,
						depth);
		if (depth === 0) {
		    depth = this.findIterationDepth(container.falsecase,
						    node,
						    depth);
		}
	    }
	    else if (container instanceof SwitchBlock) {
		depth = this.findIterationDepth(container.defaultcase,node,depth);
		if (depth === 0) {
		    depth = this.findIterationDepth(container.cases,node,depth);
		}
	    }
	    else if (container instanceof CaseBlock) {
		depth = this.findIterationDepth(container.body,node,depth);
	    }
	    else if (container instanceof StatementBlock) {
		for (var index = 0; index < container.blocks.length; index++) {
		    var block = container.blocks[index];
		    depth = this.findIterationDepth(block,node,depth);
		    if (depth !== 0) {
			break;
		    }
		}
	    }
	    else {
		depth = 0;
	    }
	}
	return depth;
    };

    this.resolveVariableRefs = function() {
	that.procedure.resolveVariableRefs(that.library.variables);
	for (var index = 0; index < that.orphans.length; index++) {
	    that.orphans[index].resolveVariableRefs(that.library.variables);
	}
    };

    this.cmdCreateProcedure = function(command) {
	var apigroup = 'tab-userdefined';
	if (command.apigroup !== undefined) {
	    apigroup = command.apigroup;
	}
	var procedure = new Procedure(command.signature,
				      command.apigroup);
	that.library.addProcedure(procedure);

	if (command.template !== undefined) {
	    that.setViewOfModel(procedure,command.template);
	    procedure.annotate('viewtag',command.viewtag);
	}
	that.updateTools();
    };

    this.cmdNameProcedure = function(name) {
    };

    this.cmdAddParameter = function(name,type,card,dir) {
    };

    this.cmdAddReturn = function(name,type) {
    };

    this.cmdDetach = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var oldcontainer = viewselection.getContainerModel();
	    var model = viewselection.getModel();
	    var orphan;
	    if (model instanceof CaseSeries ||
		model instanceof CaseBlock) {
		orphan = new CaseSeries();
	    }
	    else {
		orphan = new StatementBlock();
	    }
	    oldcontainer.moveCodeBlock(model,orphan);
	    that.orphans.push(orphan);

	}
    };

    this.cmdAttach = function(command) {
	var newcontainer = command.target;
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var oldcontainer = viewselection.getContainerModel();
	    if (oldcontainer === newcontainer) {
		console.log('not moving');
		return;
	    }
	    oldcontainer.moveCodeBlock(viewselection.getModel(),newcontainer);
	}
	that.pruneOrphans();
	that.updateIteratorVariables(that.procedure,1);
	for (var index = 0; index < that.orphans.length; index++) {
	    that.updateIteratorVariables(that.orphans[index],1);
	}
    };
	
    this.pruneOrphans = function() {
	var done = false;
	for (var len = this.orphans.length; len > 0; len--) {
	    if (this.orphans[len-1].blocks.length === 0) {
		this.orphans.splice(len-1,1);
	    }
	}
    };

    this.cmdCall = function(command) {
	var procedure;
	if (command.code !== 'return') {
	    // Lookup the procedure being called, create if not in library
	    var name = command.label.replace(/\(.*\)/,'');
	    procedure = that.library.lookupProcedure(name);
	    if (procedure === null) {
		if (command.signature !== undefined) {
		    procedure = new Procedure(command.signature);
		}
		else {
		    procedure = new Procedure();
		    procedure.name = command.label;
		}
		that.library.addProcedure(procedure);
	    }
	}
	else {
	    var retsig;
	    if (that.procedure.getReturnType() !== 'void') {
		retsig = 'void return('+that.procedure.getReturnType()+' retval)';
	    }
	    else {
		retsig = 'void return()';
	    }
	    procedure = new Procedure(retsig);
	}
	for (var index = 0; index < that.viewselected.length; index++) {
	    var block = new Call(procedure);
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();

	    if (viewselection.type == 'cursor') {
		container.appendCodeBlock(block,viewselection.getModel());
	    } else {
		container.insertCodeBlock(block,viewselection.getModel());
	    }
	    that.setViewOfModel(block,command.template);
	    block.annotate('viewtag',command.viewtag);
	}
    };

    this.cmdAddArgument = function(name) {
    };

    this.cmdClone = function(command) {
	that.cmdCopy(command);
	that.cmdPaste(command);
    };

    this.cmdCopy = function(command,strconvert_cb) {
	that.copybuffer = [];
	var converted = '';

	for (var index = 0; index < that.viewselected.length; index++) {
	    // Load up copy buffer with JSON of the block and it's followers
	    var viewselection = that.viewselected[index];
	    var block = viewselection.getModel();
	    var container = viewselection.getContainerModel();

	    // TODO: Implement a flag indicating whether to copy
	    // current block plus remainder or just the currently
	    // selected block. Current behavior is to copy
	    // everything starting from the current block forward (watebear
	    // behavior).
	    that.copybuffer.push(container.getJsonBlocks(block));
	    if (strconvert_cb !== undefined &&
		strconvert_cb != null) {
		converted = converted.concat(strconvert_cb(container));
	    }
	}
	return converted;
    };

    this.cmdPaste = function(command) {
	for (var index = 0; index < that.copybuffer.length; index++) {
	    var pasteblock;
	    var block = that.copybuffer[index];
	    if (block instanceof CaseSeries ||
		block instanceof CaseBlock) {
		pasteblock = new CaseSeries();
	    }
	    else {
		pasteblock = new StatementBlock();
	    }
	    pasteblock.loadJson(that.copybuffer[index]);
	    pasteblock.resolveVariableRefs(this.library.variables);

	    if (command.target === undefined) {
		that.orphans.push(pasteblock);
	    }
	    else {
		pasteblock.moveCodeBlock(pasteblock.blocks[0],
					 command.target);
	    }
	}
    };

    this.cmdDelete = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var block = viewselection.getModel();
	    var container = viewselection.getContainerModel();
	    container.removeCodeBlock(block);
	}
	that.pruneOrphans();
    };

    this.cmdBackspace = function(TBD) {
    };

    this.cmdStartConditional = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();
	    var test = new Expression('',[new Constant('true')]);
	    var block = new Conditional(test);

	    if (viewselection.type === 'cursor') {
		container.appendCodeBlock(block,viewselection.getModel());
	    } else {
		container.insertCodeBlock(block,viewselection.getModel());
	    }
	    container.terminated = true;

	    that.setViewOfModel(block,command.template);
	    block.annotate('viewtag',command.viewtag);
	}
    };

    this.cmdAddTestExpression = function(TBD) {
    };

    this.cmdEndConditional = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    if (viewselection.type === 'cursor') {
		// the 'if'
		var container = viewselection.getContainerModel(1); // the 'if'
		container.terminate();
		// the statementblock containing the 'if'
		var parentcontainer = viewselection.getContainerModel(2);
		parentcontainer.terminated = false;
	    }
	}
    };

    this.cmdStartArrayIterator = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();
	    var depth = 0;
	    var search = that.orphans.concat([that.procedure]);
	    for (var index = 0; index < search.length; index++) {
		depth = that.findIterationDepth(search[index],container,0);
		if (depth !== 0) {
		    break;
		}
	    }
	    depth = depth+1;
	    var variable = new Variable('<uninitialized>','float','2');
	    var varexpr = new Expression('',[new VariableRef(variable)]);
	    var indexvar = new Variable('index'+depth,'int','1');
	    var limitvar = new Constant(variable.getCardinality() - 1);
	    var curname = 'current_'+variable.getName()+'_'+depth;
	    var curexpr = new NamedExpression(curname,
					      '[]',
					      [variable,indexvar]);
	    var limitexpr = new NamedExpression('limit'+depth,
						'',
						[limitvar]);
	    // Index needs to encode nesting level
	    var block = new ArrayIterator(varexpr,indexvar,curexpr,limitexpr);

	    if (viewselection.type === 'cursor') {
		container.appendCodeBlock(block,viewselection.getModel());
	    } else {
		container.insertCodeBlock(block,viewselection.getModel());
	    }
	    container.terminated = true;

	    that.setViewOfModel(block,command.template);
	    block.annotate('viewtag',command.viewtag);

	    that.skippushstate = true; // Next command will assign the variable
	}
    };

    this.cmdStartRangeIterator = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();
	    var depth = 0;
	    var search = that.orphans.concat([that.procedure]);
	    for (var rindex = 0; rindex < search.length; rindex++) {
		depth = that.findIterationDepth(search[rindex],container,0);
		if (depth !== 0) {
		    break;
		}
	    }
	    depth = depth+1;
	    var indexvar = new Variable('index'+depth,'int','1');
	    var startvar = new Constant(0);
	    var startexpr = new NamedExpression('first'+depth,
						'',
						[startvar]);
	    var limitvar = new Constant(0);
	    var limitexpr = new NamedExpression('limit'+depth,
						'',
						[limitvar]);
	    // Index needs to encode nesting level
	    var block = new RangeIterator(startexpr,limitexpr,indexvar);

	    if (viewselection.type === 'cursor') {
		container.appendCodeBlock(block,viewselection.getModel());
	    } else {
		container.insertCodeBlock(block,viewselection.getModel());
	    }
	    container.terminated = true;

	    that.setViewOfModel(block,command.template);
	    block.annotate('viewtag',command.viewtag);
	}
    };

    this.cmdEndIterator = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    if (viewselection.type === 'cursor') {
		// the 'for'
		var container = viewselection.getContainerModel(1); // the 'for'
		container.terminate();
		// the statementblock containing the 'for'
		var parentcontainer = viewselection.getContainerModel(2);
		parentcontainer.terminated = false;
	    }
	}
    };

    this.cmdStartSwitch = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();
	    var test = new Expression('',[new Constant('0')]);
	    var block = new SwitchBlock(test);

	    if (viewselection.type === 'cursor') {
		container.appendCodeBlock(block,viewselection.getModel());
	    } else {
		container.insertCodeBlock(block,viewselection.getModel());
	    }
	    container.terminated = true;

	    that.setViewOfModel(block,command.template);
	    block.annotate('viewtag',command.viewtag);
	}
    };

    this.cmdAddCase = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();
	    var test = new Expression('',[new Constant('0')]);
	    var block = new CaseBlock(test);

	    if (viewselection.type === 'cursor') {
		container.appendCodeBlock(block,viewselection.getModel());
	    } else {
		container.insertCodeBlock(block,viewselection.getModel());
	    }
	    container.terminated = true;

	    that.setViewOfModel(block,command.template);
	    block.annotate('viewtag',command.viewtag);
	}
    };

    this.cmdAddDefault = function(command) {
    };

    this.cmdEndSwitch = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    if (viewselection.type === 'cursor') {
		// the 'for'
		var container = viewselection.getContainerModel(1); // 'switch'
		container.terminate();
		// the statementblock containing the 'switch'
		var parentcontainer = viewselection.getContainerModel(2);
		parentcontainer.terminated = false;
	    }
	}
    };

    this.cmdAssignment = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var variable = new Variable('<uninitialized>','float','1');
	    var varexpr = new Expression('', [new VariableRef(variable)]);
	    var block = new Assignment(varexpr);
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();

	    if (viewselection.type == 'cursor') {
		container.appendCodeBlock(block,viewselection.getModel());
	    } else {
		container.insertCodeBlock(block,viewselection.getModel());
	    }
	    that.setViewOfModel(block,command.template);
	    block.annotate('viewtag',command.viewtag);

	    that.skippushstate = true; // Next command will assign the variable
	}
    };

    this.cmdArrayAssignment = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var variable = new Variable('<uninitialized>','float','2');
	    var varindex = new Constant('0');
	    var varexpr = new Expression('',
					 [new Expression('[]',
							 [new VariableRef(variable),
							  varindex])]);
	    var block = new Assignment(varexpr);
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();

	    if (viewselection.type == 'cursor') {
		container.appendCodeBlock(block,viewselection.getModel());
	    } else {
		container.insertCodeBlock(block,viewselection.getModel());
	    }
	    that.setViewOfModel(block,command.template);
	    block.annotate('viewtag',command.viewtag);

	    that.skippushstate = true; // Next command will assign the variable
	}
    };

    this.cmdPlaceholder = function(command) {
    };

    this.cmdPushState = function(command,stack) {
	var curstate = {
	    command: command,
	    procedure: that.procedure.getJson(),
	    orphans: utility_getJson(that.orphans)
	};

	if (stack === undefined) {
	    stack = that.undostack;
	}
	stack.push(curstate);
    };

    this.cmdPopState = function(stack) {
	if (stack === undefined) {
	    stack = that.undostack;
	}
	var oldstate = stack.pop();
	if (oldstate !== undefined) {
	    that.procedure.loadJson(oldstate.procedure);
	    that.orphans = [];
	    utility_loadJson(that.orphans,oldstate.orphans);

	    that.resolveVariableRefs();
	}
    };

    this.cmdUndo = function() {
	that.cmdPushState({},that.redostack);
	that.cmdPopState(that.undostack);
    };

    this.cmdRedo = function() {
	that.cmdPushState({},that.undostack);
	that.cmdPopState(that.redostack);
    };

    this.cmdComment = function(command) {
	if (command.model.annotate !== undefined) {
	    command.model.annotate('comment',command.comment);
	}
    };

    this.cmdExpressionSetConstant = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();

	    if (!(container instanceof Expression)) {
		console.log('Not an expression:',viewselection,container);
		throw 'Container not an expression';
	    }

	    var constant = new Constant(command.arguments[0]);
	    container.replaceVariable(viewselection.getModel(),constant);
 	    that.setViewOfModel(constant,command.template);
	    constant.annotate('viewtag',command.viewtag);
	}
    };

    this.cmdExpressionChangeConstant = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    viewselection.getModel().setValue(command.arguments[0]);
	}
    };

    this.cmdExpressionSetVariable = function(command) {
	var definition = null;

	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();
	    var localvars = that.procedure.localVariables(container);
	    var variable;
	    // Check local variables
	    if (definition === null && localvars !== null) {
		definition = localvars.getVariable(command.label);
	    }
	    // Check return value
	    if (definition === null) {
		if (that.procedure.getReturnType() !== 'void' &&
		    that.procedure.returns.getName() === command.label) {
		    definition = that.procedure.returns;
		}
	    }
	    // Check parameters
	    if (definition === null) {
		var param = that.procedure.lookupParameter(command.label);
		if (param !== null) {
		    definition = param.vardecl;
		}
	    }
	    // Check library
	    if (definition === null) {
		definition = that.library.lookupVariable(command.label);
	    }
	    // Doesn't exist yet, create a floating point global and add to library
	    if (definition === null) {
		//console.log('set - failed to find variable:',command.label);
		//return;		// Failed to find variable definition
// 		console.log('creating set variable:',command.label);
		var type = 'float';
		if (command.label === 'true' ||
		    command.label === 'false') {
		    type = 'bool';
		}
		definition = new Variable(command.label,type);
		definition.annotate('viewtag',command.viewtag);
		that.library.addVariable(definition);
	    }
	    if (definition.getAnnotation('viewtag') === undefined) {
		definition.annotate('viewtag',command.viewtag);
	    }
	    var variable = new VariableRef(definition);

	    container.replaceVariable(viewselection.getModel(),
				      variable);
 	    that.setViewOfModel(variable,command.template);
	}
    };

    this.cmdExpressionChangeVariable = function(command) {
	var definition = null;

	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();
	    var localvars = that.procedure.localVariables(container);
	    if (definition === null && localvars !== null) {
		definition = localvars.getVariable(command.label);
	    }
	    // Check return value
	    if (definition === null) {
		if (that.procedure.getReturnType() !== 'void' &&
		    that.procedure.returns.getName() === command.label) {
		    definition = that.procedure.returns;
		}
	    }
	    // Check parameters
	    if (definition === null) {
		var param = that.procedure.lookupParameter(command.label);
		if (param !== null) {
		    definition = param.vardecl;
		}
	    }
	    if (definition === null) {
		definition = that.library.lookupVariable(command.label);
	    }
	    if (definition === null) {
// 		console.log('change - failed to find variable:',command.label);
// 		return;		// Failed to find variable definition
		console.log('creating update variable:',command.label);
		var type = 'float';
		if (command.label === 'true' ||
		    command.label === 'false') {
		    type = 'bool';
		}
		definition = new Variable(command.label,type);
		that.library.addVariable(definition);
	    }
	    var model = viewselection.getModel();
	    if (!(model instanceof VariableRef)) {
		console.log(model);
		throw 'Not a VariableRef';
	    }
	    if (definition.getAnnotation('viewtag') === undefined) {
		definition.annotate('viewtag',model.getAnnotation('viewtag'));
	    }
	    model.definition = definition;

	    that.updateIteratorVariables(that.procedure,1);
	    for (var index = 0; index < that.orphans.length; index++) {
		that.updateIteratorVariables(that.orphans[index],1);
	    }
	}
    };

    this.cmdExpressionSetExpression = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();
	    var expression = new Expression(command.arguments[0]);
	    for (var index = 0; index < command.arguments[1]; index++) {
		expression.addVariable(new Constant('TBD'));
	    }
	    container.replaceVariable(viewselection.getModel(),expression);
 	    that.setViewOfModel(expression,command.template);
	    expression.annotate('viewtag',command.viewtag);
	}
    };

    this.cmdExpressionReplace = function(command) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    var viewselection = that.viewselected[index];
	    var container = viewselection.getContainerModel();

	    container.replaceVariable(viewselection.getModel(),
				      new Constant(command.arguments[0]));
	}
    };

    this.isSelected = function(view) {
	for (var index = 0; index < that.viewselected.length; index++) {
	    if (that.viewselected[index] === view) {
		return true;
	    }
	}
	return false;
    };

};

CodeEditor.prototype.setLibrary = function(library) {
    this.library = library;
};

CodeEditor.prototype.edit = function(procedure,library,diagrams) {
    if (procedure !== undefined) { this.procedure = procedure; }
    if (library !== undefined) { this.library = library; }
    if (diagrams !== undefined) { this.diagrams = diagrams; }

    this.undostack = [];
    this.redostack = [];

    this.updateTools();

    for (var dindex = 0; dindex < this.diagrams.length; dindex++) {
	if (this.diagrams[dindex].addListener !== undefined) {
	    this.diagrams[dindex].addListener(this);
	}
	if (this.diagrams[dindex].draw !== undefined) {
	    this.diagrams[dindex].draw(this.procedure,this.orphans,this.library);
	}
    }
};

CodeEditor.prototype.clickCallback = function(event,view,model) {
    if (view !== undefined && !this.isSelected(view)) {
	for (var index = 0; index < this.viewselected.length; index++) {
	    for (var dindex in this.diagrams) {
		if (this.diagrams[dindex].unhighlight !== undefined) {
		    this.diagrams[dindex].unhighlight(this.viewselected[index]);
		}
	    }
	}
	if (view !== null && model !== null) {
	    this.viewselected = [view];

	    if (model !== this.procedure) {
		for (var dindex = 0; dindex < this.diagrams.length; dindex++) {
		    if (this.diagrams[dindex].highlight !== undefined) {
			this.diagrams[dindex].highlight(view);
		    }
		}
	    }
	}
    }
};

CodeEditor.prototype.doubleClickCallback = function(event,view,model) {
    alert('CodeEditor.doubleClickCallback');
};

CodeEditor.prototype.dropCallback = function(event,cmd,view,model) {
    this.clickCallback(event,view,model);
    this.cmdCallback(cmd);
};

CodeEditor.prototype.changeCallback = function(event,cmd,view,model) {
    if (this.changecb !== null) {
	this.changecb();
    }
};

CodeEditor.prototype.addProcedure = function(json,noupdate) {
    var isnew = false;
    var name = json.name;

    // Make sure we're not duplicating a procedure and variable name
    if (this.library.lookupVariable(name) !== null) {
	return;
    }

    var procedure = this.library.lookupProcedure(name);

    if (procedure === null) {
	procedure = new Procedure();
	isnew = true;
    }
    procedure.loadJson(json);
    procedure.resolveVariableRefs(this.library.variables);
    if (isnew === true) {
	this.library.addProcedure(procedure);
    }
    if (noupdate !== true) {
	this.updateTools();
    }
};

CodeEditor.prototype.removeProcedure = function(json,noupdate) {
    var name = json.name;
    var procedure = this.library.lookupProcedure(name);
    if (procedure !== null) {
	if (procedure !== this.procedure) {
	    this.library.removeProcedure(procedure);
	    this.updateCallReferences();
	    if (noupdate !== true) {
		this.updateTools();
	    }
	}
    }
};

CodeEditor.prototype.changeProcedure = function(json,newsig,noupdate) {
    var name = json.name;
    var procedure = this.library.lookupProcedure(name);
    if (procedure !== null) {
	this.library.renameProcedure(procedure,newsig);
	this.updateCallReferences();
	this.setViewOfModel(procedure,null); // Reset its view
	this.updateIteratorVariables(procedure,1);
	if (noupdate !== true) {
	    this.updateTools();
	}
	this.redraw();
    }
};

CodeEditor.prototype.addVariable = function(json,noupdate) {
    var isnew = false;
    var name = json.name;

    // Make sure we're not duplicating a procedure and variable name
    if (this.library.lookupProcedure(name) !== null) {
	return;
    }
    var variable = this.library.lookupVariable(name);

    if (variable === null) {
	variable = new Variable();
	isnew = true;
    }
    variable.loadJson(json);
    if (isnew === true) {
	this.library.addVariable(variable);
    }
    if (noupdate !== true) {
	this.updateTools();
    }
};

CodeEditor.prototype.removeVariable = function(json,noupdate) {
    var name = json.name;
    var variable = this.library.lookupVariable(name);
    if (variable !== null) {
	this.library.removeVariable(variable);
	if (noupdate !== true) {
	    this.updateTools();
	}
    }
};

CodeEditor.prototype.addLocalVariable = function(json,noupdate) {
    var isnew = false;
    var name = json.name;

    // Make sure we're not duplicating a procedure and variable name
    if (this.library.lookupProcedure(name) !== null ||
	this.library.lookupVariable(name) !== null) {
	return;
    }
    var variable = this.procedure.lookupLocalVariable(name);

    if (variable === null) {
	variable = new Variable();
	isnew = true;
    }
    variable.loadJson(json);
    if (isnew === true) {
	this.procedure.addLocalVariable(variable);
    }
    if (noupdate !== true) {
	this.updateTools();
    }
};

CodeEditor.prototype.removeLocalVariable = function(json,noupdate) {
    var name = json.name;
    var variable = this.procedure.lookupLocalVariable(name);
    if (variable !== null) {
	this.procedure.removeLocalVariable(variable);
	if (noupdate !== true) {
	    this.updateTools();
	}
    }
};

CodeEditor.prototype.updateTools = function() {
    console.log('CodeEditor.prototype.updateTools to be implemented by children');
    return;
};

CodeEditor.prototype.getSaveState = function() {
    var savelist = { 
						activeProcedure: this.procedure.name,
						library: utility_getJson(this.library),
						orphans: []
					};
    for (var index = 0; index < this.orphans.length; index++) {
		savelist.orphans.push(utility_getJson(this.orphans[index]));
    }
    return savelist;
};

CodeEditor.prototype.restoreSaveState = function(savestate) {
    this.clear();

    var library = new CodeLibrary();
    utility_loadJson(library,savestate.library);

    for (var index = 0; index < savestate.orphans.length; index++) {
		var orphan = new StatementBlock();
		utility_loadJson(orphan,savestate.orphans[index]);
		this.orphans.push(orphan);
    }
    this.resolveVariableRefs();
    this.updateTools();

	var activeProcedure = library.lookupProcedure(savestate.activeProcedure);
    if (activeProcedure != null) {
		this.edit(activeProcedure,library);
    }
};

CodeEditor.prototype.clearUndo = function() {
    this.undostack = [];
    this.redraw();
};

CodeEditor.prototype.clearRedo = function() {
    this.redostack = [];
    this.redraw();
};

CodeEditor.prototype.undo = function() {
    this.skippushstate = false; // Push state on next command
    this.cmdUndo();
    this.redraw();
    if (this.changecb !== null) {
	this.changecb();
    }
};

CodeEditor.prototype.redo = function() {
    this.skippushstate = false; // Push state on next command
    this.cmdRedo();
    this.redraw();
    if (this.changecb !== null) {
	this.changecb();
    }
};

CodeEditor.prototype.copy = function(strconvert_cb) {
    var codestr = this.cmdCopy({},strconvert_cb);
    this.redraw();
    if (this.changecb !== null) {
	this.changecb();
    }
    return codestr;
};

CodeEditor.prototype.cut = function(strconvert_cb) {
    var codestr = this.cmdCopy({},strconvert_cb);
    this.cmdDelete({});
    this.redraw();
    if (this.changecb !== null) {
	this.changecb();
    }
    return codestr;
};

CodeEditor.prototype.paste = function() {
    this.cmdPaste({});
    this.redraw();
    if (this.changecb !== null) {
	this.changecb();
    }
};

CodeEditor.prototype.undoEmpty = function() {
    return this.undostack.length === 0;
};

CodeEditor.prototype.redoEmpty = function() {
    return this.redostack.length === 0;
};

CodeEditor.prototype.clear = function() {
    this.procedure.blocks = [];

    var procedures = this.library.procedures;
    for (var index = 0; index < procedures.length; index++) {
	if (procedures[index].getApiGroup() === 'User Function') {
	    this.library.removeProcedure(procedures[index]);
	}
    }
    for (var index = 0; index < this.library.procedures.length; index++) {
	this.library.procedures[index].blocks = [];
    }
    this.orphans = [];
    this.undostack = [];
    this.restack = [];
    this.copybuffer = [];
    this.redraw();
    if (this.changecb !== null) {
	this.changecb();
    }
};

CodeEditor.prototype.cmdCallback = function(command) {
    var cmdmap = {
	'array_assignment': this.cmdArrayAssignment,
	'assignment': this.cmdAssignment,
	'attach': this.cmdAttach, // Attach code-fragment to a parent
	'call': this.cmdCall,
	'case': this.cmdAddCase,
	'clone':this.cmdClone,
	'copy': this.cmdCopy,
	'debugprint': this.cmdCall,
	'delete': this.cmdDelete,
	'detach': this.cmdDetach, // Detach code-fragment from parent
	'endfor': this.cmdEndIterator,
	'endif': this.cmdEndConditional,
	'endswitch': this.cmdEndSwitch,
	'foreach': this.cmdStartArrayIterator,
	'forrange': this.cmdStartRangeIterator,
	'if_eq': this.cmdStartConditional,
	'newproc' : this.cmdCreateProcedure,
	'other': null,
	'paste': this.cmdPaste,
	'setatt': null,
	'setforces': null,
	'setposition': null,
	'setvelocity': null,
	'switch': this.cmdStartSwitch,
	'undo': this.cmdUndo,
	'redo': this.cmdRedo,
	'comment': this.cmdComment,

	'expr_replace': this.cmdExpressionReplace,
	'expr_setconstant': this.cmdExpressionSetConstant,
	'expr_changeconstant': this.cmdExpressionChangeConstant,
	'expr_setvariable': this.cmdExpressionSetVariable,
	'expr_changevariable': this.cmdExpressionChangeVariable,
	'expr_setexpression': this.cmdExpressionSetExpression
    };

    if (command.code !== 'undo' &&
	command.code !== 'redo' &&
	this.skippushstate !== true) {

	this.cmdPushState(command,this.undostack); // Log state before taking any action
	this.redostack = [];
    }

    this.skippushstate = false; // Push state on next command

    if (cmdmap[command.code] !== undefined) {
	if (cmdmap[command.code] !== null) {
	    cmdmap[command.code](command);
	}
    } else {
	this.cmdCall(command);
    }
    if (command.skipredraw !== true) {
	this.redraw();
    }
    if (this.changecb !== null) {
	this.changecb();
    }
};

CodeEditor.prototype.setChangeCallback = function(callback) {
    this.changecb = callback;
};

CodeEditor.prototype.importExternals = function(newproclist,oldproclist) {
    if (oldproclist != undefined) {
	var removelist = [];
	for (var oindex in oldproclist) {
	    var found = 0;

	    for (var nindex in newproclist) {
		if (newproclist[nindex].getName() ==
		    oldproclist[oindex].getName()) {
		    found = 1;
		}
	    }
	    if (!found) {
		//alert("Removing:"+oldproclist[oindex].getCodeSignature());
		removelist.push(oldproclist[oindex]);
	    }
	}
	for (var oindex in removelist) {
	    this.library.removeProcedure(removelist[oindex]);
	}
	this.updateCallReferences();
	this.updateTools();
    }

    for (var nindex in newproclist) {
	var procedure =
	    this.library.lookupProcedure(newproclist[nindex].getName());

	if (procedure === null) {
	    // Add the new procedure
	    //alert("Adding:"+newproclist[nindex].getCodeSignature());
	    this.library.addProcedure(newproclist[nindex]);
	}
	else {
	    // Freshen the argument list definition
	    // TODO: DON'T DO THIS IF ITS GRAPHICALLY EDITED!
	    //alert("Updating:"+newproclist[nindex].getCodeSignature());
	    this.library.renameProcedure(newproclist[nindex],
					 newproclist[nindex].getCodeSignature());
	}
    }
    this.updateCallReferences();
    this.updateTools();
};
