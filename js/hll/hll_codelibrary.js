function CodeLibrary()
{
    this.datatype = 'CodeLibrary';
    this.annotations = {};

    this.procedures = [];
    this.variables = new VariableList();

    this.lookupIndex = function(name,searchlist) {
	var index = -1;
	for (var search in searchlist) {
	    if (searchlist[search].name === name) {
		index = search;
		break;
	    }
	}
	var that = this;
	return index;
    };
};

CodeLibrary.prototype.getJson = function() {
    return utility_getJson(this);
};

CodeLibrary.prototype.loadJson = function(json) {
    this.constructor();
    utility_loadJson(this,json);
};

CodeLibrary.prototype.getApiGroups = function() {
    var groups = {};

    for (var index = 0; index < this.procedures.length; index++) {
	var apigroup = this.procedures[index].getApiGroup();
	groups[apigroup] = apigroup;
    }
    return groups;
};

CodeLibrary.prototype.addProcedure = function(procedure) {
    if (this.lookupProcedure(procedure.getName()) === null) {
	this.procedures.push(procedure);
    }
};

CodeLibrary.prototype.removeProcedure = function (procedure) {
    var index = this.lookupIndex(procedure.getName(),this.procedures);
    if (index >= 0) {
	this.procedures.splice(index,1);
    }
};

CodeLibrary.prototype.renameProcedure = function (procedure, newsig) {
    var oldname = procedure.getName();
    var index = this.lookupIndex(oldname,this.procedures);
    if (index >= 0) {
	procedure = this.lookupProcedure(oldname);
	procedure.fromSignatureString(newsig);
    }
};

CodeLibrary.prototype.lookupProcedure = function (name) {
    var found = null;
    var index = this.lookupIndex(name,this.procedures);
    if (index >= 0) {
	found = this.procedures[index];
    }
    return found;
};

CodeLibrary.prototype.lookupProcedureGroup = function (apigroup) {
    var result = [];
    for (var index = 0; index < this.procedures.length; index++) {
	if (this.procedures[index].getApiGroup() === apigroup) {
	    result.push(this.procedures[index]);
	}
    }
    return result;
};

CodeLibrary.prototype.addVariable = function(variable) {
    this.variables.addVariable(variable);
};

CodeLibrary.prototype.removeVariable = function (variable) {
    this.variables.removeVariable(variable);
};

CodeLibrary.prototype.lookupVariable = function (label) {
    var found = this.variables.getVariable(label);
    if (found === undefined) {
	found = null;
    }
    return found;
};

CodeLibrary.prototype.annotate = function(key,value) {
    if (value !== undefined) {
	this.annotations[key] = value;
    }
    else {
	delete this.annotations[key];
    }
};

CodeLibrary.prototype.getAnnotation = function(key) {
    return this.annotations[key];
};
