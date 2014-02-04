
ide.blocklyLoaded = function(blockly) {
	// Called once Blockly is fully loaded.
	window.Blockly = blockly;
}


ide.getMyName = function() {
	var collaborators = ide.doc.getCollaborators();
	var len = collaborators.length;
	for(var i = 0; i < len; i++) {
		if(collaborators[i].isMe) {
			return collaborators[i].displayName;
		}
	}
	return '';
}

ide.log = function(title, content) {
	var log = ide.doc.getModel().getRoot().get('log');
	log.push({
		timestamp: new Date().getTime(),
		user: ide.getMyName(),
		title: title,
		content: content
	});
};

ide.getDocAsJSON = function() {
	var snapshot = {
		timestamp: new Date().getTime(),
		pages: {}
	};
	var pages = ide.doc.getModel().getRoot().get('pages');
	var keys = pages.keys();
	var len = keys.length;
	for(var i = 0; i < len; i++) {
		snapshot.pages[keys[i]] = pages.get(keys[i]).getText();
	}
	return JSON.stringify(snapshot);
}

ide.handleLogInsert = function(e) {
	var log = ide.doc.getModel().getRoot().get('log');
	var items = log.asArray().sort(function(a,b) {
		return b.timestamp - a.timestamp;
	});
	var len = items.length;
	$('#log-list').empty();
	for(var i = 0; i < len; i++) {
		var date = new Date(items[i].timestamp);
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
		var dateString = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + '&nbsp;' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds)
		var newa = $('<a class="list-group-item">');
		newa.append('<strong>' + items[i].user + '</strong> ' + dateString + '<br>' + items[i].title);
		$('#log-list').append(newa);
		if(items[i].content) {
			newa.attr('data-content', items[i].content);
			newa.addClass('popover-link');
		}
	}
};

ide.fitToPage = function() {
	$('#editor, #blockly-frame').height(($(window).height() - 165).toString() + "px");
	$('.panel-body').css('max-height',($(window).height() - 248).toString() + "px");
	editor.resize();
};

ide.undo = function(e) {
	ide.fromUndo = true;
	ide.doc.getModel().undo();
};

ide.redo = function(e) {
	ide.fromUndo = true;
	ide.doc.getModel().redo();
};

ide.initializeEditingUi = function() {
	var model = ide.doc.getModel();
	
	//Window resize handler
	ide.fitToPage();
	$(window).resize(ide.fitToPage);
	
	//Handler for insertion and deletion of pages
	model.getRoot().get('pages').addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, ide.handlePageListChange);
	ide.handlePageListChange();
	
	// Add event handler for UndoRedoStateChanged events.
	model.addEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, function(e) {
		if(e.canUndo) {
			ide.enableMenuItem('#menu-undo');
			$('#menu-undo').bind('click', ide.undo);
		}
		else {
			ide.disableMenuItem('#menu-undo');
		}
		if(e.canRedo) {
			ide.enableMenuItem('#menu-redo');
			$('#menu-redo').bind('click', ide.redo);
		}
		else {
			ide.disableMenuItem('#menu-redo');
		}
	});
	
	//Handler to update string when Ace changes
	editor.getSession().on('change', function(e) {
		ide.currentPage.setText(editor.getValue());
	});
	

	$('#insert-page-button').click(function() {
		$('#new-page-modal').modal('show');
	});
	
	$('#delete-page-button').click(function() {
		var c = window.confirm('Really delete this page?');
		if(c) {
			ide.deletePage($('#pages-list .active').text());
			ide.bindAce('main');
			ide.handlePageListChange();
		}
	});
	
	//Initialize log popovers
	var popovers = $('body').popover({
		selector: '.popover-link',
		container: 'body'
	});
	$('.popover-link').click(function() {
		$(this).toggleClass('popover-open');
	});
	$('body').click(function() {
		$('.popover .popover-open').popover('hide');
	});
	model.getRoot().get('log').addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, function() {
		ide.handleLogInsert();
	});
	ide.handleLogInsert();
	
	//Entry box for user log messages
	$('#log-chat-field').keypress(function(e) {
		if(e.which === 13) {
			//.text(message).html() escapes HTML to avoid XSS problems
			ide.log($('<div/>').text($(this).val()).html(),''); 
			$(this).val('');
		}
	});
	
	//Share dialog handler
	var shareClient = new gapi.drive.share.ShareClient(ide.APP_ID);
	shareClient.setItemIds(rtclient.params['fileIds']);
	$('#menu-share').click(function() {
		shareClient.showSettingsDialog();
	});
	

	
	//Show editor
	$('#main-container').show();
};

