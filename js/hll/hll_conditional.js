function Conditional(test,trueblocks,falseblocks)
{
    CodeBlock.prototype.constructor.call(this);
    this.datatype = 'Conditional';
    if (test === undefined) {
	this.test = new Expression('',[new Constant(0)]);
    } else {
	this.test = test;
    }
    
    if (trueblocks === undefined) {
	this.truecase = new StatementBlock();
    } else {
	this.truecase = trueblocks;
    }

    if (falseblocks === undefined) {
	this.falsecase = new StatementBlock();
    } else {
	this.falsecase = falseblocks;
    }
    // KLUDGE
    this.constructor = Conditional;
};

Conditional.prototype = new CodeBlock();
Conditional.prototype.constructor = Conditional;

Conditional.prototype.getBodyList = function() {
    return [this.truecase, this.falsecase];
};

Conditional.prototype.resolveVariableRefs = function(varlist) {
    this.test.resolveVariableRefs(varlist);
    this.truecase.resolveVariableRefs(varlist);
    this.falsecase.resolveVariableRefs(varlist);
};

Conditional.prototype.getName = function() {
    return 'if';		// FIXME
};

Conditional.prototype.arguments = [];

Conditional.prototype.getTrueCase = function() {
    return this.truecase;
};

Conditional.prototype.getFalseCase = function() {
    return this.falsecase;
};

Conditional.prototype.terminate = function() {
    this.truecase.terminated = true;
    this.falsecase.terminated = true;
};

Conditional.prototype.localVariables = function(node) {
    var result = null;
    if (this.test.contains(node)) {
	result = new VariableList();
    }
    else {
	result = this.truecase.localVariables(node);
	if (result === null) {
	    result = this.falsecase.localVariables(node);
	}
    }
    return result;
};
