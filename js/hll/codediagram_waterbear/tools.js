function Tools()
{
    this.acronyms = { SPHERES: 1 };
    this.blockdef = [
		     {tabId: 'tab-variables',
		      label: '[choice:vars]',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'operand',
				 viewtag: 'vars',
				 types: [Variable,NamedExpression]
			       }
		     },
	
		     {tabId: 'tab-variables',
		      label:'[choice:lvars] = [number:0]',
		      klass:'draggable comment',
		      menucmd:{ code: 'assignment',
				viewtag:'vars',
				types: [Assignment] }
		     },
		   
		     {tabId: 'tab-variables',
		      label: '[choice:arrays][[number:0]]',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'operand',
				 viewtag:'arrays',
				 types: [Expression] }
		     },

		     {tabId: 'tab-variables',
		      label:'[choice:arrays][[number:0]] = [number:0]',
		      klass:'draggable comment',
		      menucmd:{ code: 'array_assignment',
				viewtag: 'arrays',
				types: [Assignment] }
		     },
		   
		     {tabId: 'tab-logic',
		      label:'if [boolean] then',
		      klass:'draggable bool',
		      containers:1,
		      menucmd: { code: 'if_eq',
				 viewtag: 'if',
				 types: [Conditional] }
		     },

		     {tabId: 'tab-logic',
		      label:'if [boolean] then\nelse',
		      klass:'draggable',
		      containers:2,
		      menucmd: { code: 'if_eq',
				 viewtag: 'ifelse',
				 types: [Conditional] }
		     },

		     {tabId: 'tab-math',
		      label:'[number:0]',
		      'type': 'number constant',
		      klass:'draggable',
		      menucmd:{ code: 'variable',
				viewtag: 'constant',
				types: [Expression] }
		     },
		   
		     {
			 tabId: 'tab-math',
			 label: '[number:0] + [number:0]', 
			 klass: 'draggable',
			 'type': 'number', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-math',
			 label: '[number:0] - [number:0]', 
			 klass: 'draggable',
			 'type': 'number', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-math',
			 label: '[number:0] * [number:0]', 
			 klass: 'draggable',
			 'type': 'number', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-math',
			 label: '[number:0] / [number:0]', 
			 klass: 'draggable',
			 'type': 'number', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

			 {
			 tabId: 'tab-math',
			 label: '[number:0] exp [number:0]', 
			 klass: 'draggable',
			 'type': 'number', 
			 menucmd: { code: 'variable',
				    alias: 'pow()',
				    types: [Expression] }
			 },
			 
		     {
			 tabId: 'tab-math',
			 label: '[number:0] % [number:0]', 
			 klass: 'draggable',
			 'type': 'number', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {tabId: 'tab-math',
		      label: 'sqrt([number:0])',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'call',
				 types: [Expression] }
		     },
	
		     {tabId: 'tab-math',
		      label: 'ceil([number:0])',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'call',
				 types: [Expression] }
		     },
	
		     {tabId: 'tab-math',
		      label: 'floor([number:0])',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'call',
				 types: [Expression] }
		     },
	
		     {tabId: 'tab-math',
		      label: 'fabsf([number:0])',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'call',
				 types: [Expression] }
		     },
	
		     {tabId: 'tab-math',
		      label: 'cosf([number:0])',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'call',
				 signature: 'float cosf(float angle)',
				 types: [Expression] }
		     },
	
		     {tabId: 'tab-math',
		      label: 'sinf([number:0])',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'call',
				 signature: 'float sinf(float angle)',
				 types: [Expression] }
		     },
	
		     {tabId: 'tab-math',
		      label: 'tanf([number:0])',
		      klass: 'draggable',
		      'type': 'number',
		      menucmd: { code: 'call',
				 signature: 'float tanf(float angle)',
				 types: [Expression] }
		     },
	
		     {tabId: 'tab-logic',
		      label: 'switch on [number:0]\ndefault',
		      klass: 'draggable logic',
		      containers: 2,
		      menucmd:
		      { code: 'switch',
			types: [SwitchBlock]
		      }
		     },

		     {tabId: 'tab-logic',
		      label: 'case matches [constant:0]',
		      klass: 'draggable case',
		      containers: 1,
		      menucmd:
		      { code: 'case',
			types: [CaseBlock]
		      }
		     },

		     {tabId: 'tab-iterators',
		      label: 'for each in [choice:arrays]',
		      klass: 'draggable',
		      containers: 1,
		      menucmd:
		      { code: 'foreach',
			types: [ArrayIterator]
		      }
		     },

		     {tabId: 'tab-iterators',
		      label: 'for integers [number:0] to [number:10]',
		      klass: 'draggable',
		      containers: 1,
		      menucmd: { code: 'forrange',
				 signature: 'for(int start, int end)',
				 types: [RangeIterator] }
		     },

		     {tabId: 'tab-logic',
		      label: '[boolean]',
		      klass: 'draggable boolean',
		      'type': 'boolean',
		      menucmd: { code: 'boolean',
				 viewtag: 'boolean',
				 types: [Variable] }
		     },

		     {tabId: 'tab-logic',
		      label:'[choice:lvars] = [boolean]',
		      klass:'draggable',
		      menucmd:{ code: 'assignment',
				viewtag:'boolvars',
				types: [Assignment] }
		     },
		   
		     {
			 tabId: 'tab-logic',
			 label: '[number:0] == [number:0]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-logic',
			 label: '[number:0] != [number:0]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-logic',
			 label: '[number:0] >= [number:0]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-logic',
			 label: '[number:0] <= [number:0]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-logic',
			 label: '[number:0] > [number:0]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-logic',
			 label: '[number:0] < [number:0]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-logic',
			 label: '[boolean] and [boolean]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    alias: ' && ',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-logic',
			 label: '[boolean] or [boolean]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    alias: ' || ',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-logic',
			 label: 'not [boolean]', 
			 klass: 'draggable boolean',
			 'type': 'boolean', 
			 menucmd: { code: 'variable',
				    alias: '!',
				    types: [Expression] }
		     },

		     {
			 tabId: 'tab-other',
			 label:'return',
			 klass:'draggable',
			 slot: false,
			 menucmd:{ code: 'return',
				   viewtag: 'void',
				   types: [Call,Procedure] }
		     },
		     {
			 tabId: 'tab-other',
			 label:'return value [number:0]',
			 klass:'draggable',
			 slot: false,
			 menucmd:{ code: 'return',
				   viewtag: 'value',
				   types: [Call,Procedure] }
		     },
		     {
			 tabId: 'tab-iterators',
			 label:'break',
			 klass:'draggable',
			 slot: false,
			 menucmd:{ code: 'break',
				   types: [Call,Procedure] }
		     },
		     {
			 tabId: 'tab-iterators',
			 label:'continue',
			 klass:'draggable',
			 slot: false,
			 menucmd:{ code: 'continue',
				   types: [Call,Procedure] }
		     }
		     ];

    this.blocks = [];
    this.blocksTabs = [];
    this.lvars_instances = []; // Cache of variables in choice_list.lvars
    this.vars_instances = []; // Cache of variables in choice_list.vars
    this.arrays_instances = [];	// Cache of arrays in choice_list.arrays
    for (var index = 0; index < this.blockdef.length; index++) {
	var block = this.setupBlock(this.blockdef[index]);
	var tabid = this.blockdef[index].tabId.replace(/_/g,'');
	this.blocks.push(block);
	this.blocksTabs.push(tabid);
    }
};

var choice_lists = {
    lvars: [],
    vars: [],
    arrays: [],
    bools: []
};

Tools.prototype.hideFromCTP = function(block) {
    block.find('select').data('styled',1);
}

Tools.prototype.setupBlock = function(def) {
    var block = Block(def);
    var tabid = def.tabId.replace(/_/g,'');
    block.data('menucmd',def.menucmd);
    if (!def.trash) {
	block.addClass(tabid.substr(4));
    }
    // Setup type class on 1st argument
    if (def.menucmd.code === 'assignment') {
	var args = block.find('.lvars, .vars, .arrays');
	if (args.length) {
	    if (block.find('.boolean').length !== 0) {
		$(args[0]).addClass('boolean');
	    }
	}
    }
    this.hideFromCTP(block);
    return block;
};

Tools.prototype.getApiGroups = function() {
    var apigroups = {};
    for (var index = 0; index < this.blockdef.length; index++) {
	var tabid = this.blockdef[index].tabId;
	var words = tabid.replace(/tab-/,'').split('_');
	var label = '';
	for (var word = 0; word < words.length; word++) {
	    if (label !== '') {
		label += ' ';
	    }
	    if (this.acronyms[words[word].toUpperCase()] === undefined) {
		label += words[word].charAt(0).toUpperCase() + words[word].substr(1);
	    }
	    else {
		label += words[word].toUpperCase();
	    }
	}
	apigroups[label] = this.blockdef[index].tabId;
    }
    return apigroups;
};

Tools.prototype.render = function() {
    for (var index = 0; index < this.blockdef.length; index++) {
	var tab = this.blocksTabs[index];
	var children = $('#content_'+tab).children();
	if (children.length !== 0) {
	    children.detach();
	}
    }

    this.rebuildVarOptions();

    for (var index = 0; index < this.blockdef.length; index++) {
	if (this.blockdef[index].hidden !== true) {
	    var tab = this.blocksTabs[index];
	    $('#content_'+tab).append(this.blocks[index]);
	    //console.log(tab,$('#content_'+tab).children().length);
	}
    }
};

Tools.prototype.lookupLabel = function(model,label) {
    var index = this.lookupLabelIndex(model,label);
    var found = null;
    if (index !== null) {
	found = this.blocks[index].clone();
	// Hide selects from cCTP()
	found.find('select').data('styled',1);
    }
    return found;
};

Tools.prototype.lookupLabelIndex = function(model,label) {
    var found = null;

    var viewtag = model.getAnnotation('viewtag');

    label = label.replace(/\[[^\[\]]*\]|\([^\(\)]*\)/g,'');
    label = label.replace(/ +/g,'');

    for (var index = 0; index < this.blockdef.length; index++) {
	var menucmd = this.blockdef[index].menucmd;
	var toollabel = this.blockdef[index].label;
	if (menucmd.label !== undefined) {
	    toollabel = menucmd.label;
	}
	if (menucmd.alias !== undefined) {
	    toollabel = menucmd.alias;
	}

	toollabel = toollabel.replace(/\[[^\[\]]*\]|\([^\(\)]*\)/g,'');
	toollabel = toollabel.replace(/ +/g,'');


//  	console.log('ll:',label,toollabel,viewtag,
//  		    menucmd.viewtag,
//  		    menucmd.label,
// 		    menucmd.alias);
	if (toollabel === label &&
	    viewtag === menucmd.viewtag) {
	    var menutypes = menucmd.types;
	    for (var mindex = 0; mindex < menutypes.length; mindex++) {
		if (model instanceof menutypes[mindex]) {
		    found = index;
		    break;
		}
	    }
	    if (found !== null) {
		break;
	    }
	}
    }
    return found;
};

Tools.prototype.lookup = function(model,label) {
    var found = this.lookupLabel(model,label);
    if (found === null) {
	var viewtag = model.getAnnotation('viewtag');

	for (var index  = 0; index < this.blockdef.length; index++) {

	    if (viewtag === this.blockdef[index].menucmd.viewtag) {
		var menutypes = this.blockdef[index].menucmd.types;
		for (var mindex = 0; mindex < menutypes.length; mindex++) {
		    if (model instanceof menutypes[mindex]) {
			found = this.blocks[index].clone();
			// Hide selects from cCTP()
			found.find('select').data('styled',1);
			break;
		    }
		}
		if (found !== null) {
		    break;
		}
	    }
	}
    }
    return found;
};

Tools.prototype.editProcedure = function(procedure) {
    var found = this.lookupLabelIndex(procedure, procedure.getName());

    if (found !== null) {
	for (var index = 0; index < this.blocks.length; index++) {
	    if (this.blockdef[index].hidden === true) {
		//console.log('unhiding:',this.blockdef[index]);
		this.blockdef[index].hidden = false;
		this.blockdef[index].trigger = false;
		this.blockdef[index].slot = true;
		this.blockdef[index].containers = 0;
		this.blocks[index] = this.setupBlock(this.blockdef[index]);
		//console.log('unhid:',this.blockdef[index]);
	    }
	    if (this.blockdef[index].menucmd.code === 'return') {
		var defarg = /\[.*\]/.test(this.blockdef[index].label);
		var rettype = procedure.getReturnType();
		if ((rettype === 'void' && defarg) ||
		    (rettype !== 'void' && !defarg)) {
		    // Hide
		    this.blocks[index].attr('style','display: none');
		}
		else {
		    // Show (weird quirk of Waterbear - need to remove the style
		    // rather than use the ".show()", as that re-introduces
		    // an in-line display style messing up some of the graphic
		    // properties.
		    this.blocks[index].removeAttr('style');
		}
	    }
	}
	if (this.blockdef[found].hidden !== true) {
	    this.blockdef[found].hidden = true;
	    this.blockdef[found].trigger = true;
	    this.blockdef[found].slot = false;
	    this.blockdef[found].containers = 1;

	    var labelwithargs = this.blockdef[found].label;
	    var labelnoargs =
		labelwithargs.replace(/\[[^\[\]]*\]|\([^\(\)]*\)/g,'');
	    //console.log(labelwithargs,labelnoargs);
	    labelnoargs = labelnoargs.replace(/ +/g,'');

	    this.blockdef[found].label = labelnoargs;         // Hide arguments
	    this.blocks[found] = this.setupBlock(this.blockdef[found]); // Create the block
	    this.blocks[found].removeClass('number');
	    this.blocks[found].removeClass('boolean');
	    this.blocks[found].removeClass('value');
	    //console.log('tools.editProcedure:',this.blocks[found]);
	    this.blockdef[found].label = labelwithargs;	      // Restore arguments
	    // console.log('hid:',this.blockdef[found]);
	}
    }
};

Tools.prototype.resetVariables = function() {
    choice_lists.lvars = [];
    choice_lists.vars = [];
    choice_lists.arrays = [];
};

Tools.prototype.addVariable = function(variable,norender) {
    var varlists = [];
    var instances;
    if (variable.getCardinality() === '1') {
	if (variable.isWriteable()) {
	    varlists.push(choice_lists.lvars);
	}
	varlists.push(choice_lists.vars);
    }
    else {
	varlists.push(choice_lists.arrays);
    }
    for (var index in varlists) {
	if (varlists[index].indexOf(variable.getLabel()) === -1) {
	    varlists[index].push(variable.getLabel()+
				 ':'+variable.getType()+
				 ':'+variable.getCardinality());
	}
    }
    if (norender !== true) {
	this.rebuildVarOptions();
	this.render();
    }
};

Tools.prototype.rebuildVarOptions = function() {
    for (var index = 0; index < this.blockdef.length; index++) {
	var select = this.blocks[index].find('select');
	if (select.length !== 0 &&
	    /\[choice:.*\]/.test(this.blockdef[index].label)) {

	    this.blocks[index] = this.setupBlock(this.blockdef[index]);

	    // Filter out non-boolean left-side choices for bool assignment & visa-versa
	    if (this.blockdef[index].menucmd.code === 'assignment') {
		var sockets = this.blocks[index].find('.socket, .autosocket');
		if ($(sockets[0]).hasClass('boolean')) {
		    $(sockets[0]).find('option:not(.type-bool)').remove();

		}
		else {
		    $(sockets[0]).find('option:.type-bool').remove();
		}
		if ($(sockets[0]).find('option').length === 0) {
		    this.blocks[index].attr('style','display: none');
		}
		else {
		    this.blocks[index].removeAttr('style');
		}
	    }
	}
    }
};

Tools.prototype.resetProcedures = function() {
    // Remove all "dynamicproc" elements
    var index = 0;
    while (index < this.blocks.length) {
	if (this.blocks[index].hasClass('dynamicproc')) {
	    var tab = this.blocksTabs[index];
	    var children = $('#content_'+tab).children();
	    if (children.length !== 0) {
		children.detach();
	    }
	    this.blocks.splice(index,1);
	    this.blockdef.splice(index,1);
	    this.blocksTabs.splice(index,1);
	}
	else {
	    index++;
	}
    }
};

Tools.prototype.addProcedure = function(procedure,norender) {
    var block = this.lookupLabel(procedure, procedure.getName());
    //console.log('tool.addProcedure:',procedure.getCodeSignature(),block);

    if (block === null) {
	var label = procedure.getName() + '(';
	var rettype = procedure.getReturnType();
	for (var index = 0; index < procedure.parameters.length; index++) {
	    var type = procedure.parameters[index].vardecl.getType();
	    var card = procedure.parameters[index].vardecl.getCardinality();
	    if (card === '1') {
		if (type === 'char' ||
		    type === 'unsigned char' ||
			type === 'int' ||
		    type === 'unsigned int' ||
		    type === 'float') {
		    label += ' [number:0]';
		}
		else if (type === 'char*' ||
			 type === 'const char*' ||
			 type === 'passthru') {
		    label += ' [string]';
		}
		else if (type === 'bool') {
		    label += ' [boolean]';
		}
		else {
		    label += ' [number:0]';
		}
	    }
	    else {
		label += ' [choice:arrays:'+card+']';
	    }
	}
	label += ')';

	var tabstr = procedure.getApiGroup();
	tabstr = tabstr.replace(/ /g,'_');
	tabstr = tabstr.toLowerCase();
	var blockdefstr = {
	    tabId: 'tab-'+tabstr,
	    label: label,
	    klass: 'draggable dynamicproc', // TODO: Add rendering based on API group
	    menucmd: { code: 'call',
		       label: procedure.getName(),
		       signature: procedure.getCodeSignature(),
		       types: [Call,Procedure]
	    }
	};
	if (rettype === 'char' ||
		rettype === 'unsigned char' ||
		rettype === 'int' ||
	    rettype === 'unsigned int' ||
	    rettype === 'float') {
	    blockdefstr['type'] = 'number';
	    blockdefstr.menucmd.types.push(Expression);
	}
	else if (rettype === 'bool') {
	    blockdefstr['type'] = 'boolean';
	    blockdefstr.menucmd.types.push(Expression);
	}
	var block = this.setupBlock(blockdefstr);
	this.blockdef.push(blockdefstr);
	this.blocks.push(block);
	var tabid = blockdefstr.tabId.replace(/_/g,'');
	this.blocksTabs.push(tabid);

	if (norender !== true) {
	    this.render();
	}
    }
};
