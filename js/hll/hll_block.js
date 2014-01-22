function CodeBlock()
{
    this.datatype = 'CodeBlock';
    this.annotations = {};
};

CodeBlock.prototype.localVariables = function(node) {
    return null;
};

CodeBlock.prototype.getJson = function() {
    return utility_getJson(this);
};

CodeBlock.prototype.loadJson = function(json) {
    this.constructor();		// Reset our state variables
    utility_loadJson(this,json);
};

CodeBlock.prototype.annotate = function(key,value) {
    if (value !== undefined) {
	this.annotations[key] = value;
    }
    else {
	delete this.annotations[key];
    }
};

CodeBlock.prototype.getAnnotation = function(key) {
    return this.annotations[key];
};
