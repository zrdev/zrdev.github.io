function Constant(value,type)
{
    Variable.prototype.constructor.call(this);
    this.datatype = 'Constant';
    if (type !== undefined) { this.setType(type); }
    this.setInitialValues([value]);
};

Constant.prototype = new Variable();
Constant.prototype.constructor = Constant;

Constant.prototype.getValue = function() {
    return this.initializer[0];
};

Constant.prototype.setValue = function(value) {
    this.setInitialValues([value]);
};

Constant.prototype.isWriteable = function() {
    return false;
}
