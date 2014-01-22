function CodeDiagram()
{
    this.listeners = [];
    this.modelview = [];

    var that = this;

    this.getIndexFromModel = function(model) {
	if (model === undefined) {
	    throw 'model undefined';
	}
	var mapindex = null;

	for (var index in that.modelview) {
	    if (that.modelview[index].model === model) {
		mapindex = index;
		break;
	    }
	}
	return mapindex;
    }
};

CodeDiagram.prototype.view = function (domobject) {
    alert('CodeDiagram.view unimplemented');
};

CodeDiagram.prototype.addListener = function (editor) {
    if (this.hasListener(editor) !== true) {
	this.listeners.push(editor);
    }
};

CodeDiagram.prototype.hasListener = function (editor) {
    var result = false;
    for (var index = 0; index < this.listeners.length; index++) {
	if (this.listeners[index] === editor) {
	    result = true;
	    break;
	}
    }
    return result;
};

CodeDiagram.prototype.draw = function (procedure) {
    alert('CodeDiagram.draw unimplemented');
};

CodeDiagram.prototype.click = function (event,view,model) {
    for (var listener in this.listeners) {
	if (this.listeners[listener].clickCallback !== undefined) {
	    this.listeners[listener].clickCallback(event,view,model);
	}
    }
};

CodeDiagram.prototype.doubleClick = function (event,view,model) {
    for (var listener in this.listeners) {
	if (this.listeners[listener].doubleClickCallback !== undefined) {
	    this.listeners[listener].doubleClickCallback(event,view,model);
	}
    }
};

CodeDiagram.prototype.dropEvent = function (event,cmd,view,model) {
    for (var listener in this.listeners) {
	if (this.listeners[listener].dropCallback !== undefined) {
	    this.listeners[listener].dropCallback(event,cmd,view,model);
	}
    }
};

CodeDiagram.prototype.cmdEvent = function (cmd) {
    for (var listener in this.listeners) {
	if (this.listeners[listener].cmdCallback !== undefined) {
	    this.listeners[listener].cmdCallback(cmd);
	}
    }
};

CodeDiagram.prototype.highlight = function (view) {
    //alert('CodeDiagram.highlight unimplemented:'+view.getName());
};

CodeDiagram.prototype.unhighlight = function (view) {
    //alert('CodeDiagram.unhighlight unimplemented:'+view.getName());
};

CodeDiagram.prototype.setViewOfModel = function(model,view) {
    var mapindex = this.getIndexFromModel(model);
    if (mapindex !== null) {
	if (view == null) {
	    this.modelview.splice(mapindex,1);
	}
	else {
	    this.modelview[mapindex].view = view;
	}
    }
    else {
	this.modelview.push({'model':model,'view':view});
    }
};

CodeDiagram.prototype.getViewOfModel = function(model) {
    var view = null;
    var mapindex = this.getIndexFromModel(model);
    if (mapindex !== null) {
	view = this.modelview[mapindex].view;
    }
    //console.log('diagram.getViewOfModel: '+model.getName() + ' ' + view);
    return view;
};

