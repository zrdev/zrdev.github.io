function RangeIterator(startexpr,endexpr,indexvar)
{
    CodeBlock.prototype.constructor.call(this);

    this.datatype = 'RangeIterator';
    this.startexpr = startexpr;
    this.endexpr = endexpr;
    this.indexvar = indexvar;

    this.body = new StatementBlock();
    if (startexpr !== undefined){ this.body.addLocalVariable(this.startexpr); }
    if (endexpr !== undefined)  { this.body.addLocalVariable(this.endexpr); }
    if (indexvar !== undefined) { this.body.addLocalVariable(this.indexvar); }
};

RangeIterator.prototype = new CodeBlock();
RangeIterator.prototype.constructor = RangeIterator;

RangeIterator.prototype.getBodyList = function() {
    return [this.body];
};

RangeIterator.prototype.resolveVariableRefs = function(varlist) {
    this.body.resolveVariableRefs(varlist);
};

RangeIterator.prototype.terminate = function() {
    this.body.terminated = true;
};

RangeIterator.prototype.localVariables = function(node) {
    var result = null;

    if (this.startexpr.contains(node) ||
	this.endexpr.contains(node)) {

	result = new VariableList();
    }
    else {
	result = this.body.localVariables(node);
    }
    return result;
};

RangeIterator.prototype.updateVariables = function(nestdepth) {
    // Update names based on our current nesting depth.
    // NOTE - KLUDGE: Assumes knowledge of the variable naming
    // convention used by the editor.
    if (nestdepth !== undefined) {
	// index<depth>
	var indexname = this.indexvar.getName().replace(/\d+$/,nestdepth);
	var startname = this.startexpr.getName().replace(/\d+$/,nestdepth);
	var endname = this.endexpr.getName().replace(/\d+$/,nestdepth);
	if (indexname !== this.indexvar.getName()) {
	    //console.log('rangeupdate:',indexname,startname,endname);
	    this.body.renameLocalVariable(this.indexvar,indexname);
	    this.body.renameLocalVariable(this.startexpr,startname);
	    this.body.renameLocalVariable(this.endexpr,endname);
	}
    }
};
