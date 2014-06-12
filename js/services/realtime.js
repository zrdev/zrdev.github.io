/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

//This code was borrowed from the Google Drive realtime-tasks sample. 

zr.service('realtime', ['$q', '$rootScope', '$routeParams', 'config', 'drive',
	/**
	 * Handles document creation & loading for the app. Keeps only
	 * one document loaded at a time.
	 *
	 * @param $q
	 * @param $rootScope
	 * @param config
	 */
	function ($q, $rootScope, $routeParams, config, drive) {
		//Parameters for new project
		this.ideGraphical = false;
		this.gameId = null;

		this.id = null;
		this.document = null;
		var PROJ_INIT_TEXT = '\/\/Declare any variables shared between functions here\r\n\r\nvoid init(){\r\n\t\/\/This function is called once when your code is first loaded.\r\n\r\n\t\/\/IMPORTANT: make sure to set any variables that need an initial value.\r\n\t\/\/Do not assume variables will be set to 0 automatically!\r\n}\r\n\r\nvoid loop(){\r\n\t\/\/This function is called once per second.  Use it to control the satellite.\r\n}\r\n';

		/**
		 * Close the current document.
		 */
		this.closeDocument = function () {
			Blockly.Realtime.model_ = null;
			Blockly.Realtime.blocksMap_ = null;
			Blockly.Realtime.topBlocks_ = null;
			this.document.close();
			this.document = null;
			this.id = null;
		};

		/**
		 * Ensure the document is loaded.
		 *
		 * @param id
		 * @returns {angular.$q.promise}
		 */
		this.getDocument = function (id, dontReplace) {
			if (this.id === id) {
				return $q.when(this.document);
			} else if (this.document && !dontReplace) {
				this.closeDocument();
			}
			return this.load(id, dontReplace);
		};

		/**
		 * Creates a new document.
		 *
		 * @param title
		 * @returns {angular.$q.promise}
		 */
		this.createDocument = function (title, folder) {
			var deferred = $q.defer();
			var onComplete = function (result) {
				if (result && !result.error) {
					deferred.resolve(result);
				} else {
					deferred.reject(result);
				}
			};
			
			if(!folder) {
				folder = [];
			}
			
			gapi.client.request({
				'path': '/drive/v2/files',
				'method': 'POST',
				'body': JSON.stringify({
					title: title,
					mimeType: 'application/vnd.google-apps.drive-sdk',
					parents: folder
				})
			}).execute(onComplete);
			return deferred.promise;
		};
		
		var this_ = this;
		
		//Helper function for copyDocument
		this.getCurrentFileData = function(id) {
			var deferredGet = $q.defer();
			var getDocData = function (result) {
				if (result && !result.error) {
					deferredGet.resolve(result);
				}
				else {
					deferredGet.reject(result);
				}
			};
			gapi.client.request({
				'path': 'drive/v2/files/'+id+'/realtime',
				'method': 'GET'
			}).execute(getDocData);
			
			return deferredGet.promise;
		}
		
		//Helper function for copyDocument
		this.updateDocumentData = function(newFile, oldFile){
			var deferredUpdate = $q.defer();
			var onComplete = function (result) {
				if (!result){
					deferredUpdate.resolve(result);
				}
				else {
					deferredUpdate.reject(result);
				}
			};
			
			gapi.client.request({
				'path': 'upload/drive/v2/files/'+newFile.id+'/realtime',
				'method': 'PUT',
				'body': oldFile.data
			}).execute(onComplete);
			
			return deferredUpdate.promise;
		}
		
		/**
		 * Copies a document in place
		 */
		this.copyDocument = function (newTitle, id, folder) {
			var deferred = $q.defer();
			var onComplete = function (result) {
				if (result && !result.error){
					deferred.resolve(result);
				}
				else {
					deferred.resolve(result);
				}
			};
			if(!folder)
				folder = [];		
			this_.getCurrentFileData(id).then(function (oldFile) {
				this_.createDocument(newTitle, folder).then(function (copy) {
					this_.updateDocumentData(copy, oldFile).then(function(){
						onComplete(copy);
					});
				});
			});
			
			return deferred.promise;
		};

		
		/**
		 * Actually load a document. If the document is new, initializes
		 * the model.
		 *
		 * @param id
		 * @returns {angular.$q.promise}
		 */
		this.load = function (id, dontReplace) {
			var deferred = $q.defer();
			var initialize = function (model) {
				var root = model.getRoot();
				var pages = model.createMap();
				root.set('pages', pages);
				root.set('gameId', this_.gameId);
				//Initialize the main pages
				if(!this_.ideGraphical) {
					root.set('graphical', false);
					pages.set('main', model.createString(PROJ_INIT_TEXT));
				}
				else {
					root.set('graphical', true);
					root.set('cglobals', model.createMap());
					root.set('procedures', model.createMap());
					var pageRoot = model.createMap();
					pages.set('main', pageRoot);
					//This code copied from blockly/core/realtime.js
					pageRoot.set('blocks', model.createMap());
					pageRoot.set('topBlocks', model.createList());
					pageRoot.set('type','loop');
					var pageRoot2 = model.createMap();
					pages.set('init', pageRoot2);
					pageRoot2.set('type','init');
					pageRoot2.set('blocks', model.createMap());
					pageRoot2.set('topBlocks', model.createList());
				}
				var log = model.createMap();
				root.set('log', log);
				//Get user name if available
				var displayName = 'Anonymous';
				drive.getUser(function(user) {
					displayName = user.displayName;
				});
				//Log entries are identified by timestamp, plus some random digits to avoid collisions
				var key = String(new Date().getTime() + Math.random());
				log.set(key, {
					user: displayName,
					title: 'Project created',
					content: ''
				});
			};
			var onLoad = function (document) {
				//dontReplace is for loading the opponent
				if(!dontReplace) {
					this_.setDocument(id, document);
					var model = document.getModel();
					Blockly.Realtime.model_ = model;
					Blockly.zr_cpp.C_GLOBAL_VARS = model.getRoot().get('cglobals');
					Blockly.zr_cpp.procedures = model.getRoot().get('procedures');
				}
				deferred.resolve(document);
				$rootScope.$digest();
			}.bind(this);
			var onError = function (error) {
				if (error.type === gapi.drive.realtime.ErrorType.TOKEN_REFRESH_REQUIRED) {
					$rootScope.$emit('todos.token_refresh_required');
				} else if (error.type === gapi.drive.realtime.ErrorType.CLIENT_ERROR) {
					$rootScope.$emit('todos.client_error');
				} else if (error.type === gapi.drive.realtime.ErrorType.NOT_FOUND) {
					deferred.reject(error);
					$rootScope.$emit('todos.not_found', id);
				}
				$rootScope.$digest();
			};
			gapi.drive.realtime.load(id, onLoad, initialize, onError);
	
			return deferred.promise;
		};

		/**
		 * Watches the model for any remote changes to force a digest cycle
		 *
		 * @param event
		 */
		this.changeListener = function (event) {
			if (!event.isLocal) {
				$rootScope.$digest();
			}
			window.lastEvent = event;
		};
		
		window.lastEvent = null;

		this.setDocument = function (id, document) {
			document.getModel().getRoot().addEventListener(
				gapi.drive.realtime.EventType.OBJECT_CHANGED,
				this.changeListener);
			this.document = document;
			this.id = id;
		};

		this.getDocAsString = function(modelRoot, countLines) {
			var str = '';
			var pages = modelRoot.get('pages');
			var keys = pages.keys().sort();
			var len = keys.length;
			var startLines = [];
			if(!modelRoot.get('graphical')) {
				for(var i = 0; i < len; i++) {
					if(countLines) {
						//Magic number: 24 is the offset needed to make line numbers match up with the zr.cpp template; needs to be changed if zr.cpp changes
						startLines.push({
							'name': keys[i],
							'line': str.split(/\r\n|\r|\n/).length + 24
						});
					}
					str = str + '//Begin page ' + keys[i] + '\n' + pages.get(keys[i]).getText() + '\n//End page ' + keys[i] + '\n';
				}
			}
			else {
				//Save the globals
				var oldGlobals = Blockly.zr_cpp.C_GLOBAL_VARS;
				//Load the target doc's globals
				Blockly.zr_cpp.C_GLOBAL_VARS = modelRoot.get('cglobals');
				for(var i = 0; i < len; i++) {
					var topBlocks = pages.get(keys[i]).get('topBlocks').asArray();
					if(topBlocks.length === 0) {
						//This will happen when the init page has not been initialized; it will be dealt with in finishFull
						continue;
					}
					var domText = topBlocks[0].xmlDom;
					var domObj = Blockly.Xml.textToDom(domText);
					var block = Blockly.Xml.domToSoloBlock(domObj);
					var code = Blockly.zr_cpp.blockToCode(block);
					if(countLines) {
						//Magic number: 24 is the offset needed to make line numbers match up with the zr.cpp template; needs to be changed if zr.cpp changes
						startLines.push({
							'name': keys[i],
							'line': str.split(/\r\n|\r|\n/).length + 24
						});
					}
					str = str + '//Begin page ' + keys[i] + '\n' + code + '\n//End page ' + keys[i] + '\n\n';
				}
				//Add globals and adjust line numbers
				if(countLines) {
					var lengthbefore = str.split(/\r\n|\r|\n/).length;
					str = Blockly.zr_cpp.finishFull(str);
					var diff = str.split(/\r\n|\r|\n/).length - lengthbefore;
					for(var i = startLines.length; i--;) {
						startLines[i].line += diff;
					}
				}
				else {
					str = Blockly.zr_cpp.finishFull(str);
				}
			}
			//Restore globals
			Blockly.zr_cpp.C_GLOBAL_VARS = oldGlobals;
			if(countLines) {
				return [str, startLines];
			}
			return str;
		};
	}]
);
