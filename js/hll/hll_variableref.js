function VariableRef(definition)
{
    this.datatype = 'VariableRef';

    if (definition !== undefined &&
	!(definition instanceof Variable) &&
	!(definition instanceof NamedExpression)) {
	console.log(definition);
	throw 'VariableRef must reference a Variable or NamedExpression';
    }
    this.definition = definition;
};

VariableRef.prototype.resolveVariableRefs = function(varlist) {
    if (this.definition !== undefined) {
	if (varlist.contains(this.definition)) {
	    this.definition = varlist.getVariable(this.definition.getName());
	}
    }
};

VariableRef.prototype.loadJson = function(json) {
    this.constructor();
    utility_loadJson(this,json);
};

VariableRef.prototype.inScope = function (varlist) {
    return this.definition.inScope(varlist);
};

VariableRef.prototype.getCode = function(varlist) {
    return this.definition.getCode(varlist);
};

VariableRef.prototype.getName = function() {
    return this.definition.getName();
};

VariableRef.prototype.getLabel = function() {
    return this.definition.getLabel();
};

VariableRef.prototype.getAnnotation = function(key) {
    return this.definition.getAnnotation(key);
};

VariableRef.prototype.getType = function () {
    return this.definition.getType();
};

VariableRef.prototype.getCardinality = function () {
    return this.definition.getCardinality();
};

VariableRef.prototype.contains = function(variable) {
    return this === variable || this.definition === variable;
};

VariableRef.prototype.isWriteable = function () {
    return this.definition.isWriteable();
};

