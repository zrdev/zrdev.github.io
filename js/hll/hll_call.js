function Call(procedure)
{
    CodeBlock.prototype.constructor.call(this);

    this.datatype = 'Call';
    this.procedure = null;
    this.arguments = [];
    if (procedure !== undefined) {
	this.setProcedure(procedure);
    }
};

Call.prototype = new CodeBlock();
Call.prototype.constructor = Call;

Call.prototype.resolveVariableRefs = function(varlist) {
    for (var index = 0; index < this.arguments.length; index++) {
	if (this.arguments[index].resovleVariableRefs !== undefined) {
	    this.arguments[index].resolveVariableRefs(varlist);
	}
    }
};

Call.prototype.getName = function() {
    return this.procedure.name;
};

Call.prototype.setProcedure = function (procedure) {
    this.procedure = procedure;
    if (this.arguments == [] ||
	this.arguments.length != this.procedure.parameters.length) {

	this.arguments = new Array(this.procedure.parameters.length);
	for (var arg in this.procedure.parameters) {
	    // Handle array argument TODO: cleanup
	    if (this.procedure.parameters[arg].vardecl.cardinality !== '1') {
		var card = this.procedure.parameters[arg].vardecl.cardinality;
		var type = this.procedure.parameters[arg].vardecl.type;
		var tmpvar = new Variable("<uninitialized>",type,card);
		this.arguments[arg] = new Expression('',
						     [new VariableRef(tmpvar)]);
		continue;
	    }

	    // Not an array, create the right default argument type
	    switch (this.procedure.parameters[arg].vardecl.type) {
	    case 'char*':
		this.arguments[arg] = new Expression('',[new Constant("",
								      'char*')]);
		break;
	    case 'char':
		this.arguments[arg] = new Expression('',[new Constant(0,
								      'char')]);
		break;
	    case 'unsigned char':
		this.arguments[arg] = new Expression('',[new Constant(0,
								      'unsigned char')]);
		break;
	    case 'unsigned int':
		this.arguments[arg] = new Expression('',[new Constant(0,
								      'unsigned int')]);
		break;
	    case 'int':
		this.arguments[arg] = new Expression('',[new Constant(0,
								      'int')]);
		break;
	    case 'float':
		this.arguments[arg] =  new Expression('',[new Constant(0.0,
								       'float')]);
		break;
	    case 'bool':
		this.arguments[arg] = new Expression('',[new Constant(0,
								      'bool')]);
		break;
	    case 'passthru':
		this.arguments[arg] = new Expression('',[new Constant("",
								      'passthru')]);
		break;
	    default:
		this.arguments[arg] = '';
		break;
	    }
	}
    }
};

Call.prototype.setArgument = function (index, argument) {
    if (!(argument instanceof Variable) &&
	!(argument instanceof VariableRef) &&
	!(argument instanceof Expression)) {
	throw 'Argument must be a Variable, Constant or Expression';
    }
    this.arguments[index].variables[0] = argument;
};

Call.prototype.localVariables = function(node) {
    var result = null;
    
    for (var index = 0; index < this.arguments.length; index++) {
	if (this.arguments[index].contains(node)) {
	    result = new VariableList();
	    break;
	}
    }
    return result;
};
