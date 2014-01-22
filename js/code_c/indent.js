function indent(level,prefix)
{
    if (prefix === undefined) {
	prefix = '  ';
    }
    var outstr = '';
    while(level--) {
	outstr += prefix;
    }
    return outstr;
};
