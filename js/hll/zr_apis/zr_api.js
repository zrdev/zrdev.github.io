function ZrApi()
{
};

ZrApi.prototype.setupApi = function(editor) {
    // Use child subclasses to implement this
};

ZrApi.prototype.addMenuTab = function(label,editor) {
    // Used to pre-configure the tabs to ensure preferred ordering
    var id = label.replace(' ','').toLowerCase();
    editor.toolbox.addTab('tab-'+id,label);
};

ZrApi.prototype.addSignatures = function(signaturelist,editor) {
    var apigrouppat = new RegExp('^(void|unsigned\\schar|char|unsigned\\sint|int|float|bool)?'+ //type name
								 '\\s*([^:]+)::(.*)'); //API group
    
    for (var index = 0; index < signaturelist.length; index++) {
	var procedure;

	if (apigrouppat.test(signaturelist[index])) {
	    var match = apigrouppat.exec(signaturelist[index]);
	    var signature = match[1] + ' ' + match[3];
	    var apigroup = match[2].replace(/_/,' ');
	    procedure = new Procedure(signature,apigroup);
	}
	else {
	    procedure = new Procedure(signaturelist[index]);
	}
	editor.addProcedure(procedure.getJson(),true);
    }
};

ZrApi.prototype.addAliases = function(aliaslist,editor) {
    var arraypat = new RegExp('(\\w+):([^\\[]+)\\[(\\d+)\\]');
    var varpat   = new RegExp('(\\w+):(\\w+)');
    var constpat = new RegExp('(\\d+)');

    for (var alias in aliaslist) {
	var entry = null;
	var procedure = null;
	var variable = null;

	if (arraypat.test(aliaslist[alias])) {
	    match = arraypat.exec(aliaslist[alias]);
	    procedure = editor.library.lookupProcedure(match[1]);
	    if (procedure !== null) {
		variable = procedure.lookupParameter(match[2]);
	    }
	    if (variable !== null) {
		entry = new NamedExpression(alias,
					    '[]',
					    [variable.vardecl,
					     new Constant(match[3])]);
	    }
	}
	else if (varpat.test(aliaslist[alias])) {
	    match = varpat.exec(aliaslist[alias]);
	    procedure = editor.library.lookupProcedure(match[1]);
	    if (procedure !== null) {
		variable = procedure.lookupParameter(match[2]);
	    }
	    entry = new NamedExpression(alias,
					'',
					[variable.vardecl]);
	}
	else if (constpat.test(aliaslist[alias])) {
	    match = constpat.exec(aliaslist[alias]);
	    entry = new NamedExpression(alias,
					'',
					[new Constant(match[1])]);
	}
	if (entry !== null) {
	    if (procedure !== null) {
		procedure.addLocalVariable(entry);
	    }
	    else {
		editor.library.addVariable(entry,true);
	    }
	}
    }
};

