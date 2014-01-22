function InsertionPoint(model,group,domobject)
{
    this.model = model;		// HLL model being represented by insert point
    this.group = group;	        // Object containing the insertion point
    this.domobject = domobject;	// DOM object representing the insertion point
    this.type = 'cursor';	// Looks like a cursor to the editor
};

InsertionPoint.prototype.getModel = function() {
    return this.model;
};

InsertionPoint.prototype.getContainerModel = function() {
    return this.group.model;
};

InsertionPoint.prototype.disableDrop = function() {
    this.domobject.droppable('destroy');
};

InsertionPoint.prototype.setupDrop = function(diagram) {
    if (diagram === undefined) {
	throw 'InsertionPoint.prototype.setupDrop: diagram undefined'
    }
    if (this.group === undefined) {
	throw 'setupDrop with group undefined';
    }
    var that = this;
		
    this.domobject.droppable({
	    greedy: true,
	    tolerance: 'touch',
	    hoverClass:'drophover',
	    scope: 'blocks',

	    drop: function(event,ui) {
		$('.drophover').removeClass('drophover');

		var drag = $(ui.draggable);
		var graphicblock = drag.data('graphicblock');

		if (graphicblock !== undefined) {
		    var clone = drag.draggable('option','helper') === 'clone';

		    if (clone === true) {
			var cmd = {
			    code: 'clone',
			    target: that.getContainerModel()
			};
		    }
		    else {
			if (graphicblock.isDetached() !== true) {
			    graphicblock.detach(diagram);
			} else {
			    drag.detach();
			}
			var cmd = {
			    code: 'attach',
			    target: that.getContainerModel()
			};
		    }
		    diagram.dropEvent(event,
				      cmd,
				      graphicblock,
				      graphicblock.model);
		}
		else {
		    // Sanity check the new block
		    var selects = drag.find('select');
		    if (selects.length !== 0 &&
			selects.children('option').length === 0) {
			return;
		    }

		    //var value = drag.text();
		    var value = drag
			.find('label')
			.contents()
			.filter(function() {
				return this.nodeType == 3;
			    }).text();
		    value = value.replace(/ */g,'');

		    var cmd = jQuery.extend({},drag.data('menucmd'));
		    jQuery.extend(cmd, {
			        code: drag.data('menucmd').code,
				label: value,
				ccode: null,
				arguments: [], // TODO: command arguments
				template: new TemplateBlock(drag.clone(false))
				});
		    diagram.dropEvent(event,
				      cmd,
				      that,
				      that.model);
		}
	    }
	});

};
