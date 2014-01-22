function Variable(name,type,cardinality,initializers,code)
{
    this.datatype = 'Variable';
    this.annotations = {};

    this.name = '';
    this.type = '';
    this.cardinality = '1';
    this.initializer = [];

    if (name !== undefined) { this.setName(name); } // Parsed field
    if (type !== undefined) { this.setType(type); }
    if (cardinality !== undefined) { this.setCardinality(cardinality) }
    if (initializers !== undefined) { this.setInitialValues(initializers) }
    if (code !== undefined) { this.code = code; }

    var that = this;
    this.formatValue = function(value) {
	var retvalue = value;
	if ((that.type === 'char*') && value[0] !== '"') {
	    retvalue = '"'+value+'"';
	}
	else if (that.type === 'passthru') {
	    retvalue = '('+value+')';
	}
	return retvalue;
    }

};

Variable.prototype.loadJson = function(json) {
    this.constructor();
    jQuery.extend(true,this,json);
};

Variable.prototype.parseName = function(name) {
    // Look for an array definition: "typename varname[cardinality]"
    var pattern = new RegExp("^\\s*"
			     +"((unsigned char|char|unsigned int|int|float|bool|char\\\*)\\s+)?"
			     +"([a-zA-Z0-9_]+)\\s*"
			     +"(\\\[(.*)\\\])?\\s*$");
    var matches = pattern.exec(name);
    var retval = [name, "1", "float"]; // Default to just the name, one element

    if (matches !== undefined && matches !== null) {
	retval = [matches[3],matches[5],matches[2]];
	if (retval[1] === undefined) { retval[1] = '1'; }
	if (retval[2] === undefined) { retval[2] = 'float'; }
    }
    return retval;
};

Variable.prototype.setName = function (name) {
    var decl_init = name.split('=',2);
    var parsed = this.parseName(decl_init[0]);
    this.name = parsed[0];
    if (parsed[1] !== undefined) {
	this.setCardinality(parsed[1]);
    }
    if (parsed[2] !== undefined) {
	this.setType(parsed[2]);
    }
    if (decl_init[1] !== undefined) {
	var initstr = decl_init[1].replace(/\s+/g,'');
	var initializers = initstr.split(',');
	this.setInitialValues(initializers);
    }
};

Variable.prototype.setType = function (type) {

    this.type = type;

};

Variable.prototype.getType = function () {

    return this.type;

};

Variable.prototype.setInitialValues = function(initializers) {
    this.initializer = initializers;
};

Variable.prototype.getCardinality = function () {
    return this.cardinality;
};

Variable.prototype.setCardinality = function (cardinality) {

    this.cardinality = cardinality;
};

Variable.prototype.getCodeDeclaration = function () {
    var codestr = this.type + ' ' + this.name;

    if (this.getCardinality() !== '1') {
	codestr += '['+this.getCardinality()+']';
    }
    return codestr;
};

Variable.prototype.getCodeInitialize = function (indentation) {
    var codestr = '';

    if (this.getCardinality() !== '1') {
        if (this.initializer.length == 0) {
            this.initializer = ['0'];
        }
	if (this.initializer.length == 1) {
	    if (this.initializer[0] == '0' ||
		this.type == 'unsigned char' ||
		this.type == 'char') {
		codestr += indent(indentation)
		    + 'memset('
		    + this.name+','+this.initializer
		    + ',sizeof('+this.name+'));';
	    }
	    else {
		var limit = parseInt(this.getCardinality());
		codestr += indent(indentation)
		    + 'for (int ii = 0; ii < '+limit+'; ii++) {\n'
		    + indent(indentation+1)
		    + this.getName() + '[ii]'
		    + ' = ' + this.initializer[0] + ';\n'
		    + indent(indentation) + '}\n\n';
	    }
	} else {
	    var limit = parseInt(this.getCardinality());
	    if (limit > this.initializer.length) {
		limit = this.initializer.length;
	    }
	    for (var index = 0; index < limit; index++) {
		codestr += indent(indentation)
		    + this.getName() + '['+index+']'
		    + ' = ' + this.initializer[index] + ';';
		if (index < (limit-1)) {
		    codestr += '\n';
		}
	    }
	}
    }
    else if (this.initializer.length >= 1) {
	codestr +=
	indent(indentation) + this.getName() + ' = ' + this.initializer[0] + ';';
    }
    return codestr;
};

Variable.prototype.inScope = function (varlist) {
    var inscope = true;

    if (varlist !== undefined &&
	!(this instanceof Constant) &&
	!(varlist.contains(this))) {

	inscope = false;
    }
    return inscope;
};

Variable.prototype.getCode = function (varlist) {
    var code;

    if (this.code !== undefined) {
	code = this.code;
    }
    else if (this.name !== '') {
	code = this.name;
    }
    else if (this.initializer.length === 1) {
	code = this.formatValue(this.initializer[0]);
    }
    else {
	code = '[';
	for (var index in this.initializer) {
	    if (index > 0) {
		code += ', ';
	    }
	    code += this.formatValue(this.initializer[index]);
	}
	code += ']';
    }
    return code;
};

Variable.prototype.getName = function () {

    return this.name;
};

Variable.prototype.getLabel = function() {
    var retval = this.name;

    if (this.getCardinality() !== '1') {
	retval += '['+this.getCardinality()+']';
    }
    return retval;
};

Variable.prototype.contains = function(variable) {
    return this === variable;
};

Variable.prototype.annotate = function(key,value) {
    if (value !== undefined) {
	this.annotations[key] = value;
    }
    else {
	if (this.annotations[key] !== undefined) {
	    throw 'Removing annotation';
	}
	delete this.annotations[key];
    }
};

Variable.prototype.getAnnotation = function(key) {
    return this.annotations[key];
};

Variable.prototype.isWriteable = function() {
    return true;
}
