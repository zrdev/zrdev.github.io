function ExprBlock(model,container) {
    if (!(model instanceof VariableRef) &&
	!(model instanceof Constant)) {
	console.log(model);
	throw 'model not a variable reference or constant:'+model;
    }
    if (!(container instanceof ExprGroup)) {
	console.log(container);
	throw 'container not an expression group:'+container;
    }
    if (!(container.model instanceof Expression)) {
	console.log(container);
	throw 'container model is not an expression';
    }

    this.model = model;		// Model represented by the block (Variable or Constant)
    this.container = container;	// Containing graphical container (ExprGroup)
};

ExprBlock.prototype.getModel = function() {
    return this.model;
};

ExprBlock.prototype.getContainerModel = function() {
    return this.container.model;
};
