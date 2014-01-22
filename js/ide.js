/**
 * Copyright 2014 Massachusetts Institute of Technology
 * http://zerorobotics.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for IDE. 
 * @author dininno@mit.edu (Ethan DiNinno)
 */

//Namespace for IDE
var ide = ide || {};

ide.doc = null;
ide.currentPage = null;
ide.realtimeLoader = null;
ide.fromUndo = false; //Flag so Ace will update on local events only if the event is from an undo
ide.PROJ_INIT_TEXT='void init() {\n\t\n}\n\nvoid loop() {\n\t\n}\n';
ide.APP_ID = '2809468685';

/**
 * This function is called the first time that the Realtime model is created
 * for a file. This function should be used to initialize any values of the
 * model. In this case, we just create the single string model that will be
 * used to control our text box. The string has a starting value of 'Hello
 * Realtime World!', and is named 'text'.
 * @param model {gapi.drive.realtime.Model} the Realtime root model object.
 */
ide.initializeModel = function(model) {
	var pages = model.createMap();
	model.getRoot().set('pages', pages);
	pages.set('main', model.createString(ide.PROJ_INIT_TEXT));
	var log = model.createList();
	model.getRoot().set('log', log);
	log.push({
		timestamp: new Date().getTime(),
		user: '',
		title: '<i>Project created</i>',
		content: ''
	});
};

ide.insertPage = function(title) {
	var pages = ide.doc.getModel().getRoot().get('pages');
	if(!pages.has(title)) {
		pages.set(title, ide.doc.getModel().createString(''));
	}
	else {
		alert('Page "' + title + '" already exists.');
	}
};

ide.deletePage = function(title) {
	if(title !== 'main') {
		var pages = ide.doc.getModel().getRoot().get('pages');
		if(pages.has(title)) {
			pages.delete(title);
		}
		else {
			alert('Page "' + title + '" does not exist.');
		}
	}
};

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

ide.handleRemoteInsert = function(e) {
	if(!e.isLocal || ide.fromUndo) {
		ide.fromUndo = false;
		var d = editor.getSession().getDocument();
		var pos = d.indexToPosition(e.index);
		d.insert(pos, e.text);
	}
};

ide.handleRemoteRemove = function(e) {
	if(!e.isLocal || ide.fromUndo) {
		ide.fromUndo = false;
		var Range = ace.require('ace/range').Range;
		var d = editor.getSession().getDocument();
		var pos1 = d.indexToPosition(e.index);
		var pos2 = d.indexToPosition(e.index+e.text.length);
		var r = Range.fromPoints(pos1,pos2);
		d.remove(r);
	}
};

ide.handlePageListChange = function(e) {
	var pages = ide.doc.getModel().getRoot().get('pages');
	var keys = pages.keys().sort();
	var len = keys.length;
	$('#pages-list').empty();
	for(var i = 0; i < len; i++) {
		var newLi = $('<a class="list-group-item">').append(keys[i]);
		if(pages.get(keys[i]) === ide.currentPage) {
			newLi.addClass('active');
		}
		$('#pages-list').append(newLi);
	}
	$('#pages-list a').click(function(e) {
		ide.bindAce($(e.target).text());
		$('#pages-list a').removeClass('active');
		$(e.target).addClass('active');
	});
};

ide.getDocAsString = function() {
	var str = "";
	var pages = ide.doc.getModel().getRoot().get('pages');
	var keys = pages.keys().sort();
	var len = keys.length;
	for(var i = 0; i < len; i++) {
		str = str + '//Begin page ' + keys[i] + '\n' + pages.get(keys[i]).getText() + '\n//End page ' + keys[i] + '\n';
	}
	return str;
}

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

ide.bindAce = function(title) {
	if(!ide.doc.getModel().getRoot().get('pages').has(title)) {
		alert('Page "' + title + '" does not exist.');
		return;
	}
	//Unbind handlers from previous page
	if(ide.currentPage !== null) {
		ide.currentPage.removeEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, ide.handleRemoteInsert);
		ide.currentPage.removeEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, ide.handleRemoteRemove);
	}
	//Change current page and attach handlers to update Ace
	var string = ide.doc.getModel().getRoot().get('pages').get(title);
	ide.currentPage = string;
	editor.setValue(string.getText());
	string.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, ide.handleRemoteInsert);
	string.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, ide.handleRemoteRemove);
	editor.focus();
	editor.session.selection.clearSelection();
};

ide.fitToPage = function() {
	$('#editor').height(($(window).height() - 165).toString() + "px");
	$('.panel-body').css('max-height',($(window).height() - 248).toString() + "px");
	editor.resize();
};

ide.disableMenuItem = function(elem) {
	if(!$(elem).parent().hasClass('disabled')) {
		$(elem).parent().addClass('disabled');
		$(elem).unbind('click');
	}
};

ide.enableMenuItem = function(elem) {
	if($(elem).parent().hasClass('disabled')) {
		$(elem).parent().removeClass('disabled');
	}
};

ide.undo = function(e) {
	ide.fromUndo = true;
	ide.doc.getModel().undo();
};

ide.redo = function(e) {
	ide.fromUndo = true;
	ide.doc.getModel().redo();
};

// Create and render a Picker object for opening projects.
ide.loadPicker = function() {
	gapi.load('picker', {"callback" : function() {
		var picker = new google.picker.PickerBuilder().
			enableFeature(google.picker.Feature.NAV_HIDDEN).
			hideTitleBar().
			setAppId(2809468685).
			setOAuthToken(gapi.auth.getToken().access_token).
			addView(new google.picker.DocsView().
				setParent('root').
				setIncludeFolders(true).
				setMimeTypes('application/vnd.google-apps.drive-sdk.2809468685')).
			setCallback(pickerCallback).
			build();
		picker.setVisible(true);
	}});
};

// A simple callback implementation.
function pickerCallback(data) {
	if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
		var doc = data[google.picker.Response.DOCUMENTS][0];
		var id = doc[google.picker.Document.ID];
		ide.realtimeLoader.redirectTo([id], ide.realtimeLoader.authorizer.userId);
	}
}

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
	
	//Set up new page modal
	$('#new-page-modal').on('shown.bs.modal', function (e) {
		$('#new-page-name').focus();
		$('#new-page-submit').unbind('click');
		$('#new-page-submit').bind('click', function(e) {
			var pageName = $('#new-page-name').val();
			ide.insertPage(pageName);
			ide.bindAce(pageName);
			ide.handlePageListChange();
			$('#new-page-modal').modal('hide');
		});
	}).on('hidden.bs.modal', function() {
		$('#new-page-name').val('');
	}).modal({
		show: false
	});
	
	//Set up rename modal
	$('#rename-project-modal').on('shown.bs.modal', function (e) {
		$('#rename-project-name').focus();
		$('#rename-project-submit').unbind('click');
		$('#rename-project-submit').bind('click', function(e) {
			$('#rename-project-modal').modal('hide');
		});
	}).on('hidden.bs.modal', function() {
		$('#new-page-name').val('');
	}).modal({
		show: false
	});
	$('#menu-rename').click(function() {
		$('#rename-project-modal').modal('show');
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
	
	//Menu command to download project as text file
	$('#menu-download').click(function() {
		//Create phantom link with data URI to download content. Needed to specify the name of the file with download attribute (window.open gives the file a random name in Firefox.)
	    var link = document.createElement('a');
		link.setAttribute('href', 'data:text/x-c,' + encodeURIComponent(ide.getDocAsString()));
		link.setAttribute('download', 'project.cpp');
		link.setAttribute('class', 'delete-link');
		link.setAttribute('target', '_blank');
		$('head').append(link);
		link.click();
		//Delete link when done
		$('.delete-link').remove();
	});
	
	//Show editor
	$('#main-container').show();
};

ide.initializeBaseUi = function() {
	//Initialize modal dialogs
	$('#new-project-modal').on('shown.bs.modal', function (e) {
		$('#new-project-name').focus();
		$('#new-project-submit').unbind('click');
		$('#new-project-submit').bind('click', function(e) {
			ide.realtimeLoader.createNewFileAndRedirect($('#new-project-name').val());
			$('#new-project-modal').modal('hide');
		});
	}).on('hidden.bs.modal', function() {
		$('#new-project-name').val('');
	}).modal({
		show: false
	});
	
	//Bind menu click handlers
	$('#menu-new-project').click(function() {
		$('#new-project-modal').modal('show');
	});
	
	$('#menu-open-project').click(ide.loadPicker);
};

/**
 * This function is called when the Realtime file has been loaded. It should
 * be used to initialize any user interface components and event handlers
 * depending on the Realtime model. In this case, create a text control binder
 * and bind it to our string model that we created in initializeModel.
 * @param doc {gapi.drive.realtime.Document} the Realtime document.
 */
ide.onFileLoaded = function(doc) {
	ide.doc = doc;
	ide.bindAce('main'); 
	ide.initializeEditingUi();
	editor.setReadOnly(false);
	ide.log('<i>Started editing</i>','');
};

/**
* Options for the Realtime loader.
*/
ide.realtimeOptions = {
	/**
	* Client ID from the console.
	*/
	clientId: '2809468685-i7or9cfoaaeg7vb9apsn068h690bdlkr.apps.googleusercontent.com',
	
	/**
	* The ID of the button to click to authorize. Must be a DOM element ID.
	*/
	authButtonElementId: 'authButton',
	
	/**
	* Function to be called when a Realtime model is first created.
	*/
	initializeModel: ide.initializeModel,
	
	/**
	* Autocreate files right after auth automatically.
	*/
	autoCreate: false,
	
	/**
	* The name of newly created Drive files.
	*/
	defaultTitle: "New Zero Robotics Project",
	
	/**
	* The MIME type of newly created Drive Files. By default the application
	* specific MIME type will be used:
	*     application/vnd.google-apps.drive-sdk.
	*/
	newFileMimeType: null, // Using default.
	
	/**
	* Function to be called every time a Realtime file is loaded.
	*/
	onFileLoaded: ide.onFileLoaded,
	
	/**
	* Function to be called to inityalize custom Collaborative Objects types.
	*/
	registerTypes: null, // No action.
	
	/**
	* Function to be called after authorization and before loading files.
	*/
	afterAuth: null // No action.
}


/**
* Start the Realtime loader with the options.
*/
ide.startRealtime = function() {
	ide.realtimeLoader = new rtclient.RealtimeLoader(ide.realtimeOptions);
	ide.realtimeLoader.start();
}
