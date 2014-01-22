function CaseBlock(valueexpr)
{
    CodeBlock.prototype.constructor.call(this);

    this.datatype = 'CaseBlock';
    this.valueexpr = valueexpr;
    this.body = new StatementBlock;
};

CaseBlock.prototype = new CodeBlock();
CaseBlock.prototype.constructor = CaseBlock;

CaseBlock.prototype.getBodyList = function() {
    return [this.body];
};

CaseBlock.prototype.resolveVariableRefs = function(varlist) {
    this.body.resolveVariableRefs(varlist);
};

CaseBlock.prototype.terminate = function() {
    this.terminated = true;
};

CaseBlock.prototype.localVariables = function(node) {
    var result = this.body.localVariables(node);
    return result;
};
