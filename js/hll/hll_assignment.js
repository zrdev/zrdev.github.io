function Assignment(variable,expression)
{
    CodeBlock.prototype.constructor.call(this);
    this.datatype = 'Assignment';
    if (variable === undefined) {
	this.variable = new Expression('',[new Variable('empty','int')]);
    }
    else {
	this.variable = variable;
    }
    if (expression === undefined) {
	this.expression = new Expression('',[new Constant(0)]);
    }
    else {
	this.expression = expression;
    }
};

Assignment.prototype = new CodeBlock();
Assignment.prototype.constructor = Assignment;

Assignment.prototype.getVariable = function() {
    return this.variable;
};

Assignment.prototype.getExpression = function() {
    return this.expression;
};

Assignment.prototype.localVariables = function(node) {
    var result = null;

    if (this.variable.contains(node) ||
	this.expression.contains(node)) {
	result = new VariableList();
    }
    return result;
};
