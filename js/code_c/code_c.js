function CodeC()
{
    CodeDiagram.prototype.constructor.call(this);

    this.listeners = [];
    this.domobject = null;

    var that = this;

    this.renderComment = function(object, indentation) {
	if (object.getAnnotation === undefined) {
	    return '';
	}
	var comment = object.getAnnotation('comment');
	if (comment === undefined || comment == '') {
	    return '';
	}
	var lines = comment.split('\n');
	var codestr = indent(indentation) + '/* ';
	if (lines.length > 1) {
	    codestr += '\n' + indent(indentation) + ' * ';
	}
	for (var ii in lines) {
	    if (ii > 0) {
		codestr += '\n' + indent(indentation) + ' * ';
	    }
	    codestr += lines[ii];
	}
	if (lines.length > 1) {
	    codestr += '\n' + indent(indentation);
	}
	codestr += ' */\n';
	return codestr;
    }

    this.renderHllObject = function(object,indentation,elseif,varlist) {
	var map = [
    { type: Procedure, render: that.renderProcedure },
    { type: Call, render: that.renderCall },
    { type: Assignment, render: that.renderAssignment },
    { type: Conditional, render: that.renderConditional },
    { type: ArrayIterator, render: that.renderArrayIterator },
    { type: RangeIterator, render: that.renderRangeIterator },
    { type: SwitchBlock, render: that.renderSwitchBlock },
    { type: CaseBlock, render: that.renderCaseBlock },
		   ];

	var codestr = '';

	for (var mindex in map) {
	    if (object instanceof map[mindex].type) {
		codestr += this.renderComment(object, indentation);
		codestr += map[mindex].render(object,indentation,elseif,varlist);
		break;
	    }
	}
	return codestr;
    };

    this.renderArrayBoundsChecks = function(checks,indentation,varlist) {
	var codestr = ''
	for (var index = 0; index < checks.blocks.length; index++) {
	    if (checks.blocks[index] instanceof StatementBlock) {
		codestr += this.renderArrayBoundsChecks(checks.blocks[index],
							indentation,
							varlist);
	    }
	    else {
		codestr += indent(indentation)
		+ 'ASSERT('
		    + that.renderVarExpr(checks.blocks[index],varlist)
		+');\n';
	    }
	}
	return codestr;
    };

    this.renderProcedureBody = function(procedure,indentation,elseif,varlist) {
	var codestr = '';
	// Render all variable declarations
	var localvarlist = this.gatherLocalVariables(procedure);
	codestr += that.renderVariableDeclarations(localvarlist,indentation);
	if (procedure.getReturnType() !== 'void') {
	    var initialize = procedure.returns.getCodeInitialize(0);
	    if (initialize == '') {
		initialize = '# warning ' +procedure.returns.getName()+' is not explicitly initialized';
	    }
	    codestr += indent(indentation)
		+ procedure.returns.getType()
		+ ' ' + initialize
		+ '\n';
	}
	// As we recurse, incrementally build variables within their scope
	var scopedlist = new VariableList(procedure.parameters);
	if (varlist !== undefined) {
	    scopedlist = scopedlist.concat(varlist);
	}
	if (procedure.getReturnType() !== 'void') {
	    scopedlist.addVariable(procedure.returns);
	}
	codestr += that.renderStatementBlock(procedure,indentation,
					     elseif,scopedlist);
	// Jam in a extra return if it's missing
	if (procedure.blocks.length === 0 ||
	    !(procedure.blocks[procedure.blocks.length-1] instanceof Call) ||
	    procedure.blocks[procedure.blocks.length-1].getName() !== 'return') {

	    // Fake up a call to a return
	    var retsig = 'void return()';
	    if (procedure.getReturnType() !== 'void') {
		retsig = 'void return('+procedure.getReturnType()+' retval)';
	    }
	    var retcall = new Call(new Procedure(retsig));
	    if (procedure.getReturnType() !== 'void') {
		retcall.setArgument(0,procedure.returns);
	    }
	    codestr += this.renderCall(retcall,indentation,elseif,scopedlist);
	}
	     
	return codestr;
    };

    this.renderProcedure = function(procedure,indentation,elseif,varlist) {
	var codestr = this.renderComment(procedure, indentation);
	codestr += indent(indentation);
	codestr += procedure.getCodeSignature() + '\n';
	codstrt += indent(indentation) + '{\n';
	codestr += this.renderProcedureBody(procedure,indentation+1,elseif,varlist);
	codestr += indent(indentation) + '}\n';
	return codestr;
    };

    this.renderStatementBlock = function(statements,indentation,elseif,varlist) {
	var codestr = '';
	var localvars = statements.variables;
	if (varlist !== undefined) {
	    localvars = localvars.concat(varlist);
	}
	for (var bindex = 0; bindex < statements.blocks.length; bindex++) {
	    codestr += that.renderHllObject(statements.blocks[bindex],
					    indentation,
					    elseif,localvars);
	}
	return codestr;
    };

    this.renderVariableDeclarations = function(varlist,indentation) {
	var codestr = '';

	for (var index in varlist.variables) {
	    var variable = varlist.variables[index];
	    if (variable instanceof Variable &&
		index !== 'true' &&
		index !== 'false') {
		codestr += indent(indentation);
		codestr += variable.type + ' ' + variable.getName();
		if (variable.cardinality !== '1') {
		    codestr += '[' + variable.cardinality + ']';
		}
		codestr += ';\n';
	    }
	}
	if (codestr !== '') {
	    codestr += '\n';	// Separate variable declarations from code
	}
	return codestr;
    };

    this.mapApiObject = function(apigroup) {
	var codestr = '';

	if (apigroup.match(/^\s_.*/)) {
	    return codestr;	// Leading ' _', don't prefix
	}

	switch(apigroup) {
	case 'SPHERES Controls':
	    codestr += 'api.';
	    break;
	case 'User Function':
	    break;
	case 'Math':
	    break;
	case 'Debug':
	    break;
	case '':
	    break;
	default:
	    codestr += 'game.';
	    break;
	}
	return codestr;
    };

    this.renderCall = function(call,indentation,elseif,varlist) {
	var codestr = '';

	// Scope checks
	for (var aindex in call.arguments) {
	    if (call.arguments[aindex].inScope(varlist) === false) {
		codestr += indent(indentation)
		    + '# error '
		    + that.renderVarExpr(call.arguments[aindex],varlist)
		    + ' is out of scope\n';
	    }
	}
	// Array bounds checking
	for (var aindex in call.arguments) {
	    var checks = call.arguments[aindex].getRuntimeArrayChecks();
	    codestr += that.renderArrayBoundsChecks(checks,indentation,varlist);
	}

	// Code
	if (call.procedure.name === 'continue' ||
	    call.procedure.name === 'break') {

	    codestr += indent(indentation);
	    codestr += call.procedure.name + ';\n';
	}
	else if (call.procedure.name === 'return') {
	    codestr += indent(indentation);
	    codestr += call.procedure.name;
	    if (call.arguments.length !== 0) {
		codestr += '(' + that.renderVarExpr(call.arguments[0]) + ')';
	    }
	    codestr += ';\n';
	}
	else {
	    codestr += indent(indentation);
	    codestr += that.mapApiObject(call.procedure.getApiGroup());
	    codestr += call.procedure.name + '(';
	    for (var aindex in call.arguments) {
		if (aindex > 0) {
		    codestr +=  ', ';
		}
		codestr += that.renderVarExpr(call.arguments[aindex],varlist);
	    }
	    codestr += ');\n';
	}
	return codestr;
    };

    this.renderAssignment = function(assignment,indentation,elsif,varlist) {
	var codestr = '';
	var checks;

	// Variable scope checks
	if (assignment.getVariable().inScope(varlist) === false) {
	    codestr += indent(indentation)
		+ '# error '
		+ that.renderVarExpr(assignment.getVariable,varlist)
		+ ' is out of scope\n';
	}
	if (assignment.getExpression().inScope(varlist) === false) {
	    codestr += indent(indentation)
	        + '# error '
	        + that.renderVarExpr(assignment.getExpression(),varlist)
	        + ' is out of scope\n';
	}
	// Runtime array bounds checks
	if (assignment.getVariable() instanceof Expression) {
	    checks = assignment.getVariable().getRuntimeArrayChecks();
	    codestr += that.renderArrayBoundsChecks(checks,indentation,varlist);
	}
	checks = assignment.getExpression().getRuntimeArrayChecks();
	codestr += that.renderArrayBoundsChecks(checks,indentation,varlist);

	// Actual assignment code
	codestr += indent(indentation);
	codestr += that.renderVarExpr(assignment.getVariable(),varlist);
	codestr += ' = ';
	codestr += that.renderExpression(assignment.getExpression(),varlist) + ';\n';
	return codestr;
    };

    this.renderConditional = function(conditional,indentation,elseif,varlist) {
	var codestr = '';
	var teststr = that.renderVarExpr(conditional.test,varlist);

	// Scope checks
	if (conditional.test.inScope(varlist) === false) {
	    codestr += indent(indentation) +
		'#error ' + teststr + ' is out of scope\n';
	}

	// Runtime array bounds checks
	var checks = conditional.test.getRuntimeArrayChecks();
	codestr += that.renderArrayBoundsChecks(checks,indentation,varlist);


	if (elseif === undefined) {
	    elseif = false;
	}
	if (elseif === false) {
	    codestr += '\n';
	    codestr += indent(indentation) + 'if (' + teststr + ') {\n';
	}
	else {
	    codestr += indent(indentation) + 'else if (' + teststr + ') {\n';
	}
	codestr += that.renderStatementBlock(conditional.truecase,
					     indentation+1,
					     false,varlist);
	codestr += indent(indentation) + '}\n';

	if (conditional.falsecase.blocks.length !== 0) {
	    if (conditional.falsecase.blocks.length === 1 &&
		conditional.falsecase.blocks[0] instanceof Conditional) {
		codestr += that.renderStatementBlock(conditional.falsecase,
						     indentation,
						     true,varlist);
	    }
	    else {
		codestr += indent(indentation) + 'else {\n';
		codestr += that.renderStatementBlock(conditional.falsecase,
						     indentation+1,
						     elseif,varlist);
		codestr += indent(indentation) + '}\n';
	    }
	}
	codestr += '\n';
	return codestr;
    };

    this.renderSwitchBlock = function(switchblock,indentation,elseif,varlist) {
	var codestr = '';
	var cases = switchblock.cases.blocks;

	// Scope checks
	if (switchblock.selectexpr.inScope(varlist) === false) {
	    codestr += indent(indentation) +
		'#error ' + that.renderVarExpr(switchblock.selectexpr,varlist) + ' is out of scope\n';
	}

	// Array bounds checks
	var checks = switchblock.selectexpr.getRuntimeArrayChecks();
	codestr += that.renderArrayBoundsChecks(checks,indentation,varlist);

	codestr += indent(indentation);
	codestr += 'switch((int) '+that.renderVarExpr(switchblock.selectexpr,varlist)+') {\n';
	for (var index = 0; index < cases.length; index++) {
	    if (index !== 0) {
		codestr += '\n';
	    }
	    codestr += that.renderCaseBlock(cases[index],
					    indentation,
					    elseif,varlist);
	}

	if (index !== 0) {
	    codestr += '\n';
	}
	codestr += indent(indentation);
	codestr += 'default:\n';
	codestr += that.renderStatementBlock(switchblock.defaultcase,
					     indentation+1,
					     elseif,varlist);
	codestr += indent(indentation+1);
	codestr += 'break;\n';

	codestr += indent(indentation);
	codestr += '}\n';
	return codestr;
    };

    this.renderCaseBlock = function(caseblock,indentation,elseif,varlist) {
	var codestr = '';

	codestr += indent(indentation);
	codestr += 'case ' + that.renderVarExpr(caseblock.valueexpr,varlist) + ':\n';
	codestr += that.renderStatementBlock(caseblock.body,
					     indentation+1,
					     elseif,varlist);
	codestr += indent(indentation+1);
	codestr += 'break;\n';

	return codestr;
    };

    this.renderArrayIterator = function(arrayiterator,indentation,elseif,varlist) {
	var codestr = '';

	var arrayvar = arrayiterator.arrayexpr.variables[0];
	var limit = arrayvar.getCardinality();
	var indexname = arrayiterator.indexvar.getName();

	// Scope checks
	if (arrayvar.inScope(varlist) === false) {
	    codestr += indent(indentation) +
		'#error '+arrayvar.getLabel()+' is out of scope\n';
	}

	codestr += '\n';
	codestr += indent(indentation);
	codestr += '/* iterate over ' + arrayvar.getLabel() + ' */\n'
	codestr += indent(indentation);
	codestr += 'for ('+indexname+' = 0; ';
	codestr += indexname + ' < ' + limit + '; ';
	codestr += indexname + '++) {\n';

	codestr += that.renderStatementBlock(arrayiterator.body,
					     indentation+1,
					     elseif,varlist);
	codestr += indent(indentation) + '}\n';

	codestr += '\n';
	return codestr;
    };

    this.renderRangeIterator = function(rangeiterator,
					indentation,
					elseif,
					varlist) {
	var codestr = '';

	var startvar = rangeiterator.startexpr.variables[0];
	var limitvar = rangeiterator.endexpr.variables[0];
	var indexname = rangeiterator.indexvar.getName();
	var compare = ' <= ';
	var incr = '++';

	if (startvar.inScope(varlist) === false) {
	    codestr += indent(indentation) +
		'#error ' + that.renderVarExpr(startvar) + ' is out of scope\n';
	}

	if (limitvar.inScope(varlist) === false) {
	    codestr += indent(indentation) +
		'#error ' + that.renderVarExpr(limitvar) + ' is out of scope\n';
	}

	if (startvar.getValue !== undefined &&
	    limitvar.getValue !== undefined) {

	    if (parseInt(startvar.getValue()) >
		parseInt(limitvar.getValue())) {
		incr = '--';
		compare = ' >= ';
	    }
	}
	codestr += '\n';
	codestr += indent(indentation);
	codestr += '/* iterate over range */\n'
	codestr += indent(indentation);
	codestr += 'for ('+indexname+' = ' + that.renderVarExpr(startvar) + '; ';
	codestr += indexname + compare + that.renderVarExpr(limitvar) + '; ';
	codestr += indexname + incr + ') {\n';

	codestr += that.renderStatementBlock(rangeiterator.body,
					     indentation+1,
					     elseif,varlist);
	codestr += indent(indentation) + '}\n';

	codestr += '\n';
	return codestr;
    };

    this.renderVarExpr = function(expr,varlist) {
	if (expr.datatype == 'Expression') {
	    return that.renderExpression(expr,varlist);
	}
	else if (expr.getCode !== undefined) {
	    return expr.getCode(varlist);
	}
	else {
	    return '';
	}
    };

    this.renderExpression = function (expr,varlist) {
	/*  EXAMPLEs:
            real math   ||      3 + 1 * 2.5             ||      9 - 4 - 1.3
            hll code    ||      (+, [3, (*, [1, 2.5])]) ||      (-, [9, 4, 1.3])
            c string    ||      "(3 + (1 * 2.5))"       ||      "(9 - 4 - 1.3)"
	*/
	var needs_outerparen = true;
	if (expr.groupOperator() ||
	    expr.isFunction() ||
	    expr.variables.length === 1) {
	    needs_outerparen = false;
	}

	var codestr = String('');
	if (needs_outerparen) { codestr += '(' };

	if (expr.isFunction()) {

	    if (expr.procedure !== undefined &&
		expr.procedure !== null) {
		codestr += that.mapApiObject(expr.procedure.getApiGroup());
	    }

	    codestr += expr.functionName() + '(';
	    for (var index = 0; index < expr.variables.length; index++) {
		if (index > 0) {
		    codestr += ', ';
		}
		codestr += that.renderVarExpr(expr.variables[index],varlist);
	    }
	    codestr += ')';
	}
	else if (expr.variables.length == 1) {
	    // Unary operator
	    codestr += expr.operator + that.renderVarExpr(expr.variables[0],varlist);
	}
	else if (expr.variables.length > 1) {
	    try {
		codestr += that.renderVarExpr(expr.variables[0],varlist);
	    }
	    catch (e) {
		console.log(expr.variables[0]);
		throw e;
	    }

	    for (var i=1; i < expr.variables.length; i++) {
		if (expr.groupOperator()) {
		    codestr +=
		    expr.operator[0] +
			that.renderVarExpr(expr.variables[i],varlist) +
			expr.operator[1];
		}
		else {
		    codestr += ' '+expr.operator+' '+that.renderVarExpr(expr.variables[i],varlist);
		}
	    }
	}
	if (needs_outerparen) { codestr += ')'; };
	return codestr;
    };

    this.gatherLocalVariables = function(statements) {
	var varlist = new VariableList();
	varlist = varlist.concat(statements.variables);
	for (var bindex in statements.blocks) {
	    if (statements.blocks[bindex] instanceof Conditional) {
		var truecase = statements.blocks[bindex].truecase;
		var falsecase = statements.blocks[bindex].falsecase;
		varlist = varlist.concat(this.gatherLocalVariables(truecase));
		varlist = varlist.concat(this.gatherLocalVariables(falsecase));
	    }
	    else if (statements.blocks[bindex] instanceof ArrayIterator) {
		var body = statements.blocks[bindex].body;
		varlist = varlist.concat(this.gatherLocalVariables(body));
	    }
	    else if (statements.blocks[bindex] instanceof RangeIterator) {
		var body = statements.blocks[bindex].body;
		varlist = varlist.concat(this.gatherLocalVariables(body));
	    }
	}
	return varlist;
    };
};

CodeC.prototype = new CodeDiagram();
CodeC.prototype.constructor = CodeC;

CodeC.prototype.view = function(domobject) {
    this.domobject = domobject;
	this.domobject.wrap('<pre class="zr-canvas"/>');
	//$(window).trigger('resize');
	if (!this.textEditor) {
		this.textEditor = new CodeMirror($("pre#zr-ccode-tab")[0], {
				lineNumbers: true,
				matchBrackets: true,
				theme: 'monokai',
				readOnly : true,
				mode: "text/x-c++src"
			  });
	}
	$('#zr-ccode-tab .CodeMirror-scroll').height($('#zr-ccode-tab').height() - 10);
	$(window).resize();
	this.textEditor.refresh();
};

CodeC.prototype.globalExternVarDeclarations = function(library) {
    var codestr = '';
    if (library !== undefined) {
	varlist = library.variables;
	codestr += '/* Global Library Variables */\n';
	for (var varname in varlist.variables) {
	    if (varname !== 'true' && varname !== 'false') {
		codestr += 'extern '
		    + varlist.variables[varname].getCodeDeclaration() + ';\n';
	    }
	}
	codestr += '\n';
    }
    return codestr;
};

CodeC.prototype.globalVarDeclarations = function(library) {
    var codestr = '';
    if (library !== undefined) {
	varlist = library.variables;
	codestr += '/* Global Library Variables */\n';
	for (var varname in varlist.variables) {
	    if (varname !== 'true' && varname !== 'false') {
		codestr += varlist.variables[varname].getCodeDeclaration() + ';\n';
	    }
	}
	codestr += '\n';
    }
    return codestr;
};

CodeC.prototype.procedureDeclarations = function(library) {
    var codestr = '';
    if (library !== undefined) {
	proclist = library.procedures;
	codestr += '/* Library Procedures */\n';
	for (var index = 0; index < proclist.length; index++) {
	    var declaration = proclist[index].getCodeDeclaration();
	    // Filter out passthru declarations
	    if (/passthru/.test(declaration)) {
		continue;
	    }
	    codestr += declaration + '\n';
	}
	codestr += '\n';
    }
    return codestr;
};

CodeC.prototype.globalInit = function(library) {
    codestr = this.globalInitSignature(library) + '\n{\n';
    codestr += this.globalInitBody(library) + '}\n\n';
    return codestr;;
}

CodeC.prototype.globalInitSignature = function(library) {
    var codestr = '';
    var initlist = library.lookupProcedureGroup('_init');
    //alert("globalInitSignature:"+initlist);
    if (initlist.length !== 0) {
	codestr += initlist[0].getCodeSignature();
    }
    return codestr;
};

CodeC.prototype.globalInitBody = function(library) {
    var codestr = '';
    if (library !== undefined) {
	varlist = library.variables;
	for (var varname in varlist.variables) {
	    if (varname !== 'true' && varname !== 'false') {
		var initialize = varlist.variables[varname].getCodeInitialize(1);
		if (initialize == '') {
		    initialize = '# warning ' + varname +' is not explicitly initialized';
		}
		codestr += initialize + '\n';
	    }
	}
    }
    return codestr;
};

CodeC.prototype.procedure = function(procedure,library) {
    var codestr = this.renderComment(procedure,0);
    codestr += this.procedureSignature(procedure,library) + '\n{\n';
    codestr += this.procedureBody(procedure,library) + '}\n\n';
    return codestr;
};

CodeC.prototype.procedureSignature = function(procedure,library) {
    var codestr = procedure.getCodeSignature();
    return codestr;
};

CodeC.prototype.procedureBody = function(procedure,library) {
    if (library !== undefined) {
	varlist = library.variables;
    }
    codestr = this.renderProcedureBody(procedure,1,false,varlist);
    return codestr;
};

CodeC.prototype.orphanBody = function(orphan,library) {
    if (library !== undefined) {
	varlist = library.variables;
    }
    codestr = this.renderStatementBlock(orphan,1,false,varlist);
    return codestr;
};

CodeC.prototype.drawAll = function(procedure,orphans,library) {
    var codestr = 'typedef int bool;\n';
    codestr += this.globalExternVarDeclarations(library);
    codestr += this.globalVarDeclarations(library);
    codestr += this.procedureDeclarations(library);
    codestr += this.globalInitSignature(library) + '\n{\n';
    codestr += this.globalInitBody(library) + '}\n\n';
    codestr += this.procedureSignature(procedure,library) + '\n{\n';
    codestr += this.procedureBody(procedure,library) + '}\n\n';
    for (var index = 0; index < library.procedures.length; index++) {
	var libproc = library.procedures[index];
	if (libproc.getName() !== procedure.getName()) {
	    codestr += this.procedureSignature(libproc,library) + '\n{\n';
	    codestr += this.procedureBody(libproc,library) + '}\n\n';
	}
    }
    if (orphans !== undefined && orphans.length !== 0) {
	codestr += '\n#if 0\n';
	codestr += '/* ---- Orphaned code ---- */\n';

	for (var index=0; index<orphans.length; index++) {
	    codestr += '\n' + indent(1) + '/* --- Orphan ' + index + ' --- */\n';
	    codestr += this.renderStatementBlock(orphans[index],1,false,varlist);
	    codestr += indent(1) + '/* --- End Orphan ' + index + ' --- */\n';
	}

	codestr += '/* ---- End Orphaned code ---- */\n';
	codestr += '#endif /* 0 */\n';
    }
    return codestr;
};

CodeC.prototype.draw = function (procedure,orphans,library) {
    if (false) {
		var allcode = this.drawAll(procedure,orphans,library);
		window.prompt('Copy to clipboard: Ctrl-C, Enter',allcode);
		//this.domobject.html(allcode).wrap('<pre class="zr-canvas"/>');
		
		// Update: Need to highlight the content.
		this.textEditor.setValue(allcode);
		
		// Update it to the text editor.
		window.textEditor.setValue(allcode);
		
		return;
    }
    var codestr = '';
    var varlist;

    /* codestr += this.globalExternVarDeclarations(library); */
    if (false) {
		codestr += this.procedureDeclarations(library);
    }

    codestr += this.renderComment(procedure, 0);
    codestr += this.procedureSignature(procedure,library) + '\n{\n';
    codestr += this.procedureBody(procedure,library) + '}\n\n';

    if (orphans !== undefined && orphans.length !== 0) {
		codestr += '\n#if 0\n';
		codestr += '/* ---- Orphaned code ---- */\n';
	
		for (var index=0; index<orphans.length; index++) {
			codestr += '\n' + indent(1) + '/* --- Orphan ' + index + ' --- */\n';
			codestr += this.renderStatementBlock(orphans[index],1,false,varlist);
			codestr += indent(1) + '/* --- End Orphan ' + index + ' --- */\n';
		}
	
		codestr += '/* ---- End Orphaned code ---- */\n';
		codestr += '#endif /* 0 */\n';
    }
    
	// Update: Need to highlight the content.
	this.textEditor.setValue(codestr);
	// Update it to the text editor.
	window.textEditor.setValue(codestr);
};

CodeC.prototype.simplescan = function (codepage) {
    var depth = { 'brace': 0, 'paren': 0, 'bracket': 0 };
    var toggle = { 'quot': 0, 'apos': 0 };
    var procedures = [];
    var arm = 1;		// Start armed

    //alert('scanning: '+codepage);
    for (var charindex = 0; charindex < codepage.length; charindex++) {
	switch(codepage[charindex])
	{
	    // Ignore whitespace
	case ' ':
	case '\n':
	case '\t':
	    break;
	    // Escape character, skip next character
	case '\\': charindex++; arm = 0; break;
	    // {},(),[]
	case '{': depth['brace']++; arm = 0; break;
	case '}':
	    depth['brace']--;
	    (depth['brace'] == 0) ? arm = 1 : arm = 0;
	    break;
	case '(': depth['paren']++; arm = 0; break;
	case ')': depth['paren']--; arm = 0; break;
	case '[': depth['bracket']++; arm = 0; break;
	case ']': depth['bracket']--; arm = 0; break;
	    // Quotes
	case '"': toggle['quot'] = !toggle['quot']; arm = 0; break;
	case '\'': toggle['apos'] = !toggle['apos']; arm = 0; break;
	    // Comments
	case '/':
	    if (codepage[charindex+1] === '/') {
		// '//'
		while (charindex < codepage.length && codepage[charindex] != '\n') {
		    charindex++;
		}
	    }
	    else if (codepage[charindex+1] === '*') {
		// /* ... */
		charindex += 2;
		while ((charindex+1) < codepage.length && 
		       (codepage[charindex] != '*' || codepage[charindex+1] != '/')) {
		    charindex++;
		}
	    }
	    break;
	    // Semicolon
	case ';':
	    if (!depth['brace'] && !depth['paren'] && !depth['bracket'] &&
		!toggle['quot'] && !toggle['apos']) {
		arm = 1;
	    }
	    else {
		arm = 0;
	    }
	    break;
	default:
	    if (!depth['brace'] && !depth['paren'] && !depth['bracket'] &&
		!toggle['quot'] && !toggle['apos'] && arm) {

		// Look for opening brace of the function
		var semi = codepage.indexOf(';',charindex);
		var endindex = codepage.indexOf('{',charindex);
		if (endindex < 0 || (semi >= 0 && semi < endindex)) {
		    break;	// No brace, skip it 
		}
		var sig = codepage.substring(charindex,endindex);

		// Strip out any embedded comments in the signature
		sig = sig.replace(/\/\*.*\*\//,' ');
		sig = sig.replace(/\/\/.*\n/,' ');

		//alert("Testing: "+sig);
		try {
		    // Try to parse the signature (throws exception on invalid)
		    var procedure = new Procedure(sig,'User Function');
		    //alert(procedure.getCodeSignature());
		    procedures.push(procedure);
		    charindex = endindex - 1; // Next scan starts at the brace
		    //alert("NextScan: "+codepage.substr(charindex+1));
		} catch (e) {
		    // Nope - not a procedure declaration we can use
		    //alert("Caught error:"+e);
		}
	    }
	    arm = 0;
	    break;
	}
    }
    //alert('Scanned '+procedures.length+' procedures');
    return procedures;
};
