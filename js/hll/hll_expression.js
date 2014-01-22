function Expression(operator, variables) {
    this.datatype = 'Expression';
    this.annotations = {};

    this.operator = null;
    this.variables = [];
    if (operator !== undefined) { this.operator = operator; }
    if (variables !== undefined) { this.variables = variables; }
};

Expression.prototype.loadJson = function(json) {
    this.constructor();		// Reset our state variables
    utility_loadJson(this,json);
};

Expression.prototype.setProcedure = function(procedure) {
    this.procedure = procedure;
};

Expression.prototype.resolveVariableRefs = function(varlist) {
    for (var index = 0; index < this.variables.length; index++) {
	if (this.variables[index].resolveVariableRefs !== undefined) {
	    this.variables[index].resolveVariableRefs(varlist);
	}
    }
};

Expression.prototype.isFunction = function() {
    return /[^()]+\(.*\)/.test(this.operator)
};

Expression.prototype.functionName = function() {
    return this.operator.replace(/\(.*\)/,'');
};

Expression.prototype.groupOperator = function() {
    return (this.operator === '[]' ||
	    this.operator === '()' ||
	    this.operator === '{}' ||
	    this.operator === "''" ||
	    this.operator === '""');
};

Expression.prototype.inScope = function (varlist) {
    var inscope = true;

    for (var index = 0; index < this.variables.length; index++) {
	if (this.variables[index].inScope(varlist) === false) {
	    inscope = false;
	    break;
	}
    }
    return inscope;
};

Expression.prototype.getCode = function (varlist) {
    /*  EXAMPLEs:
        real math   ||      3 + 1 * 2.5             ||      9 - 4 - 1.3
        hll code    ||      (+, [3, (*, [1, 2.5])]) ||      (-, [9, 4, 1.3])
        c string    ||      "(3 + (1 * 2.5))"       ||      "(9 - 4 - 1.3)"
    */

    var needs_outerparen = true;
    if (this.groupOperator() ||
	this.isFunction() ||
	this.variables.length === 1) {
	needs_outerparen = false;
    }

    var codestr = String('');
    if (needs_outerparen) { codestr += '(' };

    if (this.isFunction()) {
	codestr += this.functionName() + '(';
	for (var index = 0; index < this.variables.length; index++) {
	    if (index > 0) {
		codestr += ', ';
	    }
	    codestr += this.variables[index].getCode(varlist);
	}
	codestr += ')';
    }
    else if (this.variables.length == 1) {
	// Unary operator
	codestr += this.operator + this.variables[0].getCode(varlist);
    }
    else if (this.variables.length > 1) {
	try {
	    codestr += this.variables[0].getCode(varlist);
	}
	catch (e) {
	    console.log(this.variables[0]);
	    throw e;
	}

	for (var i=1; i < this.variables.length; i++) {
	    if (this.groupOperator()) {
		codestr +=
		    this.operator[0] +
		    this.variables[i].getCode(varlist) +
		    this.operator[1];
	    }
	    else {
		codestr += ' '+this.operator+' '+this.variables[i].getCode(varlist);
	    }
	}
    }
    if (needs_outerparen) { codestr += ')'; };
    return codestr;
};

Expression.prototype.addVariable = function(addVar) {
    this.variables.push(addVar); 
};

Expression.prototype.delVariable = function(delVar) {
    if (this.variables.indexOf(delVar) !== -1) {
        this.variables.splice(this.variables.indexOf(delVar), 1);
    }
};

Expression.prototype.replaceVariable = function(oldvar, newvar) {
    var index = this.variables.indexOf(oldvar);
    if (index !== -1) {
	this.variables[index] = newvar;
    }
};

Expression.prototype.contains = function(variable) {
    var result = false;
    if (this === variable) {
	result = true;
    }
    else {
	for (var index = 0; index < this.variables.length; index++) {
	    result = this.variables[index].contains(variable);
	    if (result === true) {
		break;
	    }
	}
    }
    return result;
};

/* TEST CASES:
    I'm not sure yet how users will enter expressions, but this model can handle
    many different ways of entering/interpreting them.
*/

function test() {
    console.log('TEST 1   | 2+3+4 | one operator');
        var plus = new Expression('+', [new Constant(2), new Constant(3), new Constant(4)]);
        console.log('   ' + setupTest(plus, String('(2+3+4)')));
    console.log('TEST 2A | 2+3*4 | order of ops');
        var mult = new Expression('*', [new Constant(3), new Constant(4)]);
        var plus = new Expression('+', [2, mult]);
        console.log('   ' + setupTest(plus, '(2+(3*4))'));
    console.log('TEST 2B | 2+3*4 | right to left');
        var plus = new Expression('+', [new Constant(2), new Constant(3)]);
        var mult = new Expression('*', [plus, new Constant(4)]);
        console.log('   ' + setupTest(mult, '((2+3)*4)'));
    console.log('TEST 3A | 2.5*1.2/5*8+-3 | right to left');
        var multA = new Expression('*', [new Constant(2.5), new Constant(1.2)]);
        var div = new Expression('/', [multA, new Constant(5)]);
        var multB = new Expression('*', [div, new Constant(8)]);
        var plus = new Expression('+', [multB, new Constant(-3)]);
        console.log('   ' + setupTest(plus, String('((((2.5*1.2)/5)*8)+-3)')));
    console.log('TEST 3B | 2.5*1.2/5*8+-3 | grouped ops');
        var div = new Expression('/', [new Constant(1.2), new Constant(5)]);
        var mult = new Expression('*', [new Constant(2.5), div, new Constant(8)]);
        var plus = new Expression('+', [mult, new Constant(-3)]);
        console.log('   ' + setupTest(plus, '((2.5*(1.2/5)*8)+-3)'));
}

function setupTest(expression, shouldBe) {
    var code = expression.getCode();
    var equal = (shouldBe == code);
    var pass = equal ? 'PASS: ' : 'FAIL: '
    return pass + code
}

Expression.prototype.annotate = function(key,value) {
    if (value !== undefined) {
	this.annotations[key] = value;
    }
    else {
	delete this.annotations[key];
    }
};

Expression.prototype.getAnnotation = function(key) {
    return this.annotations[key];
};

Expression.prototype.getType = function() {
    var precedence = {
	'void': 0,
	'bool': 1,
	'char': 2,
	'int': 3,
	'unsigned char': 4,
	'unsigned int': 5,
	'float': 6,
	'char*': 7,
	'passthru':8
    };
	
	

    var typename = 'void';

    if (this.operator === '[]') { // Array lookup ([](array,index))
	typename = this.variables[0].getType();
    }
    if (this.isFunction()) {
	typename = 'FUNCTION';	// TODO: Determine method for type lookup from library
    }
    else {
	// Determine the type result of the variables assuming
	// a simple ordered precedence rule
	for (var index = 0; index < this.variables; index++) {
	    var vartype = this.variables[index].getType();
	    if (precedence[vartype] >= precedence[typename]) {
		typename = vartype;
	    }
	}
    }
    return typename;
};

Expression.prototype.getCardinality = function() {
    var card = '1';

    if (this.operator === '[]') { // Array lookup ([](array,index))
	// Assume the array lookup will result in a cardinality of '1'
	card = '1';
    }
    if (this.isFunction()) {
	// Assume functions return 1 item
	card = '1';
    }
    else {
	// Determine the type result of the variables assuming
	// a simple ordered precedence rule
	for (var index = 0; index < this.variables; index++) {
	    var varcard = this.variables[index].getCardinality();
	    if (parseInt(varcard) > parseInt(card)) {
		card = varcard;
	    }
	}
    }
    return card;
};

Expression.prototype.getRuntimeArrayChecks = function() {
    var statements = new StatementBlock();
    if (this.operator === '[]') {
	var limit = this.variables[0].getCardinality();
	var indexexpr = this.variables[1];
	if (indexexpr instanceof VariableRef) {
	    indexexpr = indexexpr.definition;
	}
	if (indexexpr instanceof Expression) {
	    var blocks = indexexpr.getRuntimeArrayChecks();
	    statements.appendCodeBlock(blocks);
	}
	if (!(indexexpr instanceof Constant)) {
	    var testexpr;
	    testexpr = new Expression('>=',[indexexpr,new Constant(0)]);
	    statements.appendCodeBlock(testexpr);
	    testexpr = new Expression('<',[indexexpr,new Constant(limit)]);
	    statements.appendCodeBlock(testexpr);
	}
    }
    else {
	for (var index = 0; index < this.variables.length; index++) {
	    if (this.variables[index] instanceof Expression) {
		var blocks = this.variables[index].getRuntimeArrayChecks();
		statements.appendCodeBlock(blocks);
	    }
	}
    }
    return statements;
};

Expression.prototype.isWriteable = function() {
    var result = false;

    if (this.operator === '[]') {
	result = this.variables[0].isWriteable();
    }
    return result;
}

