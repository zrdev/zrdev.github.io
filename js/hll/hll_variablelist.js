function VariableList(vararray)
{
    this.datatype = 'VariableList';
    this.annotations = {};

    this.variables = {};
    if (vararray !== undefined) {
	for (var index = 0; index < vararray.length; index++) {
	    this.addVariable(vararray[index].vardecl);
	}
    }
};

VariableList.prototype.resolveVariableRefs = function(varlist) {
    for (var name in this.variables) {
	if (this.variables[name].resolveVariableRefs !== undefined) {
	    this.variables[name].resolveVariableRefs(varlist);
	}
    }
};

VariableList.prototype.contains = function(variable) {
    return this.variables[variable.getName()] !== undefined;
};

VariableList.prototype.loadJson = function(json) {
    this.constructor();
    utility_loadJson(this,json);
};

VariableList.prototype.addVariable = function(variable) {
    this.variables[variable.getName()] = variable;
};

VariableList.prototype.removeVariable = function(variable) {
    var name = variable.getName();
    if (this.variables[name] !== undefined) {
	delete this.variables[name];
    }
};

VariableList.prototype.renameVariable = function(variable,newname) {
    var tmpvar = new Variable(newname); // Handle parsing
    if (this.variables[tmpvar.getName()] !== undefined) {
        this.variables[tmpvar.getName()].setName(newname); // New name exists, update card/inits
	return;
    }
    var name = variable.getName();
    if (this.variables[name] !== undefined) {
	var variable = this.variables[name];
	variable.setName(newname);
	this.variables[tmpvar.getName()] = variable;
	delete this.variables[name];
    }
};

VariableList.prototype.getVariable = function(label) {
    var tmpvar = new Variable(label); // Deal with array reformatting (strips [])
    var name = tmpvar.getName();
    if (this.variables[name] === undefined) {
	return null;
    }
    return this.variables[name];
};

VariableList.prototype.concat = function(varlist) {
    var concatlist = new VariableList();
    jQuery.extend(concatlist.variables,this.variables,varlist.variables);
    return concatlist;
};

VariableList.prototype.annotate = function(key,value) {
    if (value !== undefined) {
	this.annotations[key] = value;
    }
    else {
	delete this.annotations[key];
    }
};

VariableList.prototype.getAnnotation = function(key) {
    return this.annotations[key];
};

