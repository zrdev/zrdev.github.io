// TODO: use common library for variable management (see hll_codelibrary.js)

function StatementBlock(blocks,terminated)
{
    this.datatype = 'StatementBlock';
    this.annotations = {};

    if (blocks === undefined) {
	this.blocks = [];
    } else {
	this.blocks = blocks;
    }

    if (terminated !== undefined) {
	this.terminated = terminated;
    } else {
	this.terminated = false;
    }

    this.variables = new VariableList();
};

StatementBlock.prototype.getBodyList = function() {
    return [this];
};

StatementBlock.prototype.findBlockIndex = function (block) {
    var retindex = null;
    for (var index = 0; index < this.blocks.length; index++) {
	if (this.blocks[index] === block) {
	    retindex = index;
	    break;
	}
    }
    return retindex;
};

StatementBlock.prototype.doIndent = function (prefix,indent) {
    var codestr = '';
    while(indent--) {
	codestr += prefix;
    }
    return codestr;
};

StatementBlock.prototype.getCode = function (prefix,indent) {
    var codestr = '';

    for (var block = 0; block < this.blocks.length; index++) {
	codestr += this.blocks[block].getCode(prefix,indent);
    }
    return codestr;
};

StatementBlock.prototype.getJson = function () {
    return utility_getJson(this);
};

StatementBlock.prototype.loadJson = function (json) {
    this.constructor();		// Reset our state variables
    utility_loadJson(this,json);
};

StatementBlock.prototype.getJsonBlocks = function (codeblock) {
    var json = {};
    var index = this.findBlockIndex(codeblock);
    if (index !== null) {
	var len = 1;
	len = this.blocks.length - index;
	var tmp = new StatementBlock(this.blocks.slice(index),
				     this.terminated);
	json = utility_getJson(tmp);
    }
    return json;
};

StatementBlock.prototype.resolveVariableRefs = function(varlist) {
    this.variables.resolveVariableRefs(varlist);

    for (var index = 0; index < this.blocks.length; index++) {
	if (this.blocks[index].resolveVariableRefs !== undefined) {
	    this.blocks[index].resolveVariableRefs(varlist.concat(this.variables));
	}
    }
};

StatementBlock.prototype.addLocalVariable = function (variable)
{
    this.variables.addVariable(variable);
};

StatementBlock.prototype.removeLocalVariable = function (variable)
{
    this.variables.removeVariable(variable);
};

StatementBlock.prototype.renameLocalVariable = function (variable,newname)
{
    this.variables.renameVariable(variable,newname);
};

StatementBlock.prototype.lookupLocalVariable = function (name) {
    var found = this.variables.getVariable(name);
    if (found === undefined) {
	found = null;
    }
    return found;
};

StatementBlock.prototype.insertCodeBlock = function (codeblock, where) {
    var index = this.findBlockIndex(where);
    if (index !== null) {
	this.blocks.splice(index,0,codeblock);
    } else {
	this.blocks.splice(0,0,codeblock);
    }
};

StatementBlock.prototype.appendCodeBlock = function (codeblock, where) {
    var index = this.findBlockIndex(where);
    if (index !== null) {
	this.blocks.splice(index+1,0,codeblock);
    } else {
	this.blocks.push(codeblock);
    }
};

StatementBlock.prototype.moveCodeBlock = function (codeblock, target) {
    var index = this.findBlockIndex(codeblock);
    if (index !== null) {
	var len = 1;
	len = this.blocks.length - index;
	var removed = this.blocks.splice(index,len);
	target.blocks = target.blocks.concat(removed);
    }
};

StatementBlock.prototype.removeCodeBlock = function (codeblock) {
    var index = this.findBlockIndex(codeblock);
    if (index !== null) {
	var len = 1;
	len = this.blocks.length - index;
	var removed = this.blocks.splice(index,len);
    }
};

StatementBlock.prototype.removeSingleCodeBlock = function (codeblock) {
    var index = this.findBlockIndex(codeblock);
    if (index !== null) {
	var len = 1;
	var removed = this.blocks.splice(index,len);
    }
};

StatementBlock.prototype.uses = function (name) {};

StatementBlock.prototype.localVariables = function(node) {
    var result = null;
    
    for (var index = 0; index < this.blocks.length; index++) {
	result = this.blocks[index].localVariables(node);
	if (result !== null) {
	    result = result.concat(this.variables);
	    break;
	}
    }
    return result;
};

StatementBlock.prototype.annotate = function(key,value) {
    if (value !== undefined) {
	this.annotations[key] = value;
    }
    else {
	delete this.annotations[key];
    }
};

StatementBlock.prototype.getAnnotation = function(key) {
    return this.annotations[key];
};
