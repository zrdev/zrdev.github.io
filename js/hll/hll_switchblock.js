function SwitchBlock(selectexpr)
{
    CodeBlock.prototype.constructor.call(this);

    this.datatype = 'SwitchBlock';
    this.selectexpr = selectexpr;
    this.cases = new CaseSeries();
    this.defaultcase = new StatementBlock();
};

SwitchBlock.prototype = new CodeBlock();
SwitchBlock.prototype.constructor = SwitchBlock;

SwitchBlock.prototype.getBodyList = function() {
    return [this.cases, this.defaultcase];
};

SwitchBlock.prototype.resolveVariableRefs = function(varlist) {
    this.selectexpr.resolveVariableRefs(varlist);
    this.cases.resolveVariableRefs(varlist);
    this.defaultcase.resolveVariableRefs(varlist);
};

SwitchBlock.prototype.terminate = function() {
    for (var index = 0; index < this.cases.blocks.length; index++) {
	this.cases.blocks[index].terminate();
    }
};

SwitchBlock.prototype.localVariables = function(node) {
    var result = null;
    if (this.selectexpr.contains(node)) {
	result = new VariableList();
    }
    else {
	result = this.cases.localVariables(node);
	if (result === null) {
	    result = this.defaultcase.localVariables(node);
	}
    }
    return result;
};
