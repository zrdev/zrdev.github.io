function ArrayIterator(arrayexpr,indexvar,curexpr,limitexpr)
{
    CodeBlock.prototype.constructor.call(this);

    this.datatype = 'ArrayIterator';
    this.arrayexpr = arrayexpr;
    this.indexvar = indexvar;
    this.limitexpr = limitexpr;
    this.curexpr = curexpr;

    this.body = new StatementBlock();

    if (indexvar !== undefined) { this.body.addLocalVariable(this.indexvar); }
    if (limitexpr !== undefined) {this.body.addLocalVariable(this.limitexpr); }
    if (curexpr !== undefined) { this.body.addLocalVariable(this.curexpr); }
};

ArrayIterator.prototype = new CodeBlock();
ArrayIterator.prototype.constructor = ArrayIterator;

ArrayIterator.prototype.getBodyList = function() {
    return [this.body];
};

ArrayIterator.prototype.terminate = function() {
    this.body.terminated = true;
};

ArrayIterator.prototype.resolveVariableRefs = function(varlist) {
    this.arrayexpr.resolveVariableRefs(varlist);
    this.body.resolveVariableRefs(varlist);
};

ArrayIterator.prototype.updateVariables = function(nestdepth) {
    // Update names based on our current nesting depth.
    // NOTE - KLUDGE: Assumes knowledge of the variable naming
    // convention used by the editor.
    if (nestdepth !== undefined) {
	// index<depth>
	var indexname = this.indexvar.getName().replace(/\d+$/,nestdepth);
	var limitname = this.limitexpr.getName().replace(/\d+$/,nestdepth);
	var curname = this.curexpr.getName().replace(/\d+$/,nestdepth);
	if (indexname !== this.indexvar.getName()) {
	    //console.log('arrayupdate:',curname,indexname,limitname);
	    this.body.renameLocalVariable(this.indexvar,indexname);
	    this.body.renameLocalVariable(this.limitexpr,limitname);
	    this.body.renameLocalVariable(this.curexpr,curname);
	}
    }

    // Update our limit value
    var limitval = this.arrayexpr.variables[0].getCardinality() - 1;
    this.limitexpr.variables[0].setValue(limitval);

    // Update the name of our "current_<arrayname>" variable
    var oldname = this.curexpr.name;
    var newname = this.arrayexpr.variables[0].getName();

    if (oldname !== newname) {
	this.curexpr.variables[0] = this.arrayexpr.variables[0];

	var exprname = oldname.replace(/_[^_]+/,'_'+newname);
	this.body.renameLocalVariable(this.curexpr,exprname);
    }
};

ArrayIterator.prototype.localVariables = function(node) {
    var result = null;

    if (this.arrayexpr.contains(node)) {
	result = new VariableList();
    }
    else {
	result = this.body.localVariables(node);
    }
    return result;
};
