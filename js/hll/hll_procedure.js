function Procedure(signaturestr,apigroup)
{
    StatementBlock.prototype.constructor.call(this);

    this.datatype = 'Procedure';
    this.name = '';
    this.parameters = [];
    this.returns = null;
    this.textbody = null;	// When code is coming from another editor

    if (apigroup !== undefined) {
	this.setApiGroup(apigroup);
    }
    else {
	this.setApiGroup('');
    }

    if (signaturestr !== undefined) {
	this.fromSignatureString(signaturestr);
	var that = this;
    }
};

Procedure.prototype = new StatementBlock();
Procedure.prototype.constructor = Procedure;

Procedure.prototype.useGraphicalEditor = function() {
    var result = false;
    if (this.textbody !== null) {
	result = true;
    }
    return result;
};

Procedure.prototype.setApiGroup = function(groupname) {
    this.apigroup = groupname;
};

Procedure.prototype.getApiGroup = function() {
    return this.apigroup;
};

Procedure.prototype.getTextBody = function() {
    if (this.textbody === null) {
	this.textbody = StatementBlock.prototype.getCode.call(this,'  ',0);
    }
    return this.textbody;
};

Procedure.prototype.setTextBody = function(textbody) {
    this.textbody = textbody;
};

Procedure.prototype.getCodeDeclaration = function () {
    return this.getCodeSignature() + ';'
};

Procedure.prototype.getCodeSignature = function () {
    var codestr = '';
    if (this.returns !== null) {
	codestr += this.returns.type + ' ';
    } else {
	codestr += 'void ';
    }
    codestr += this.name;
    codestr += '(';
    var first = true;
    for (var parameter = 0; parameter < this.parameters.length; parameter++) {
	if (first == false) {
	    codestr += ', ';
	}
	first = false;
	codestr += this.parameters[parameter].vardecl.type + ' ';
	codestr += this.parameters[parameter].vardecl.name;
	if (this.parameters[parameter].vardecl.getCardinality() !== '1') {
	    codestr +=
		'['+this.parameters[parameter].vardecl.getCardinality()+']';
	}
    }
    codestr += ')';
    return codestr;
}

Procedure.prototype.getCode = function (prefix,indent) {
    var codestr = '\n' + this.doIndent(prefix,indent) + '{\n';
    codestr += StatementBlock.prototype.getCode.call(this,prefix,indent+1);
    codestr += this.doIndent(prefix,indent) + '}\n';
    return codestr;
}

Procedure.prototype.setName = function (name) {
    this.name = name;
};

Procedure.prototype.getName = function () {
    return this.name;
};

Procedure.prototype.fromSignatureString = function (signaturestr) {
    var signature = this.parseSignature(signaturestr);
    if (signature === null) {
	throw 'Bad signature:'+signaturestr;
    }
    this.setName(signature.name);
    this.setReturnVariable(new Variable('retval = 0',signature.returntype));

    this.parameters = [];

    for (var parm = 0; parm < signature.parameters.length; parm++) {
	this.addParameter(signature.parameters[parm].vardecl,
			  signature.parameters[parm].direction);
    }
};

Procedure.prototype.addParameter = function (variable, direction) {
    this.parameters.push({ vardecl: variable, dir: direction });
};

Procedure.prototype.removeParameter = function (variable) {
    for (var parameter = 0; parameter < this.parameters.length; parameter++) {
	if (this.parameters[parameter].vardecl.name == variable.name) {
	    this.parameters[parameter].splice(parameter,1);
	    break;
	}
    }
};

Procedure.prototype.lookupParameter = function(label) {
    var tmpvar = new Variable(label);
    var name = tmpvar.getName();
    var parameter = null;
    for (var index = 0; index < this.parameters.length; index++) {
	if (this.parameters[index].vardecl.getName() === name) {
	    parameter = this.parameters[index];
	    break;
	}
    }
    return parameter;
};

Procedure.prototype.setReturnVariable = function (variable) {
    if (variable !== undefined && variable !== null) {
	this.returns = variable;
    } else {
	this.returns = null;
    }
};

Procedure.prototype.getReturnType = function() {
    var rettype = 'void';
    if (this.returns !== null) {
	rettype = this.returns.type;
    }
    return rettype;
};

Procedure.prototype.parseSignature = function(signature) {
    var pattern = new RegExp("^((void|unsigned\\schar|char|unsigned\\sint|int|float|bool)\\s+)?"+ // return
			     "([a-zA-Z_]+[a-zA-Z_0-9]*)\\s*"+ // name
			     "(\\s*\\(" + // open paren
			     "\\s*("+
			     "\\s*void\\s*|(unsigned\\schar|char|unsigned\\sint|int|float|bool|passthru)\\s*\\**\\s*"+
			     "([a-zA-Z_]+[a-zA-Z_0-9]*)\\s*"+ // name
			     "((\\[\\s*[a-zA-Z_0-9]+\\s*\\])*)\\s*"+ // array
			     "(,\\s*"+
			     "(unsigned\\schar|char|unsigned\\sint|int|float|bool|char|passthru)\\s*\\**\\s*"+
			     "([a-zA-Z_]+[a-zA-Z_0-9]*)\\s*"+ // name
			     "((\\[\\s*[a-zA-Z_0-9]+\\s*\\])*)\\s*"+ // array
			     ")*"+
			     ")?"+
			     "\\))?\\s*" + // close paren/0 or 1 parmlist
			     "$" // close paren
			     );
    var parmpattern = new RegExp("void|((unsigned\\schar|char|unsigned\\sint|int|float|bool|passthru)\\s*\\**)\\s*"+
				"([a-zA-Z_]+[a-zA-Z_0-9]*)"+
				"(\\s*(\\[\\s*([a-zA-Z_0-9]+)\\s*\\])*)\\s*"
				);
    var matches = pattern.exec(signature);
    if (matches === null) {
	return null;
    }
    var parmlist = [];
    var parm = {
	vardecl: new Variable(),
	direction: 'in'
    };
    if (matches[5]) {
	var parms = matches[5].split(',');
	var parmnames = {};

	for (var ii = 0; ii < parms.length; ii++) {
	    parm = { vardecl: new Variable(), direction: 'in' };
	    var parmmatch = parmpattern.exec(parms[ii]);
	    if (parmmatch[1]){
		var dir = 'in';
		if (/.*\*/.test(parmmatch[1])) {
		    dir = 'inout';
		}
		var card = $.trim(parmmatch[6]);
		if (card === undefined ||
		    card === null ||
		    card == '') {
		    card = '1';
		} else {
		    if (/.*\*/.test(parmmatch[1])) {
			/* no support for mixed ptrs/arrays ... yet */
			return null;
		    }
		    if (card == '1') {
			/* array - length of 1 */
			dir = 'inout';
		    } else {
			dir = 'inout';
		    }
		}
		parm.vardecl.setName($.trim(parmmatch[3]));
		parm.vardecl.setType($.trim(parmmatch[1]));
		parm.vardecl.setCardinality(card);
		parm.direction = dir;
	    }
	    if (parm.vardecl.name in parmnames) {
		// alert('Duplicate parameter name');
		return null;
	    }
	    parmlist.push(parm);
	    parmnames[parm.name] = 1;
	}
    } else {
	// parmlist.push(parm);
    }

    // Check symbolic array sizing
    for (var index = 0; index < parmlist.length; index++) {
	var card = parmlist[index].vardecl.getCardinality();
	if (!/[0-9]+/.test(card)) {
	    var found = false;
	    for (var search = 0; search < parmlist.length; search++) {
		if (parmlist[search].vardecl.getName() === card) {
		    found = true;
		    break;
		}
	    }
	    if (found !== true) {
		console.log('Bad cardinality for:',parmlist[index]);
		return null;
	    }
	}
    }

    var returnType = matches[2];
    if (returnType === undefined){
	returnType = 'void';
    }
    var signature = {
	returntype : returnType,
	name : matches[3],
	parameters : parmlist
    };
    return signature;
};

/* 
   inherited from StatementBlock
   - addLocalVariable
   - removeLocalVariable
   - lookupLocalVariable
   - insertCodeBlock
   - appendCodeBlock
   - removeCodeBlock
   - uses
*/
