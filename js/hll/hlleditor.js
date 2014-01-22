function HllEditor()
{
    this.anchor = null;
    this.toolbox = null;
    this.editor = null;
    this.diagram = null;
    this.codediagram = null;
    this.model = null;
};

HllEditor.prototype.init = function(options) {
    this.anchor = $('#'+options.anchor);
    this.anchor.empty();

    if (!('cByDefault' in options)) {
	options.cByDefault = false;
    }

    var tooldomobject = $('<div class="zr-toolbox"/>').appendTo(this.anchor);
    this.toolbox = new Toolbox();
    this.toolbox.create(tooldomobject);


    var editortabdef =
    '<div class="zr-bottom-tabs ui-tabs-bottom ui-corner-bottom">' +
    '  <ul>'+
    '    <li><a href="#zr-edit-tab">Editor</a></li>'+
    '    <li><a href="#zr-ccode-tab">C Code</a></li>'+
    '  </ul>'+
    '  <div id="zr-edit-tab">'+
    '    <div class="zr-canvas"/>'+
    '  </div>'+
    '  <div id="zr-ccode-tab"/>'+
    '</div>';

    var editordomobject = $(editortabdef).appendTo(this.anchor);
    editordomobject.tabs({selected: 0});

    //Somewhat of a hack to get the tabs at the bottom of the page to appear properly
    $(window).resize(function() {
	    var height =
		$(window).height() - 
		$(editordomobject).offset().top - 
		($(editordomobject).outerHeight(true) - 
		 $(editordomobject).height());

	    $(editordomobject).height(Math.max(height,200));
	    $(".zr-canvas").height($(editordomobject).height() - 32);
	});
		
};
