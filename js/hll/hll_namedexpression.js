function NamedExpression(name,operator,variables)
{
    Expression.prototype.constructor.call(this,operator,variables);
    this.datatype = 'NamedExpression';
    this.setName(name);
};

NamedExpression.prototype = new Expression();
NamedExpression.prototype.constructor = NamedExpression;

NamedExpression.prototype.getName = function() {
    return this.name;
};

NamedExpression.prototype.getLabel = function() {
    return this.getName();
};

NamedExpression.prototype.setName = function(name) {
    this.name = name;
};

NamedExpression.prototype.getCode = function(varlist) {
    var code = Expression.prototype.getCode.call(this,varlist);
    code += ' /* '+this.getName()+' */';
    return code;
};
