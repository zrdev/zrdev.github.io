function CaseSeries()
{
    StatementBlock.prototype.constructor.call(this);
    this.datatype = 'CaseSeries';
};

CaseSeries.prototype = new StatementBlock();
CaseSeries.prototype.constructor = CaseSeries;

