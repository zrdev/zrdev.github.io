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

zr.service('realtime', ['$q', '$rootScope', '$routeParams', 'config', 
	/**
	 * Handles document creation & loading for the app. Keeps only
	 * one document loaded at a time.
	 *
	 * @param $q
	 * @param $rootScope
	 * @param config
	 */
	function ($q, $rootScope, $routeParams, config) {
		this.ideGraphical = false;
		this.id = null;
		this.document = null;
		var PROJ_INIT_TEXT = 'void init() {\n\t\n}\n\nvoid loop() {\n\t\n}\n';

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
		this.getDocument = function (id) {
			if (this.id === id) {
				return $q.when(this.document);
			} else if (this.document) {
				this.closeDocument();
			}
			return this.load(id);
		};

		/**
		 * Creates a new document.
		 *
		 * @param title
		 * @returns {angular.$q.promise}
		 */
		this.createDocument = function (title) {
			var deferred = $q.defer();
			var onComplete = function (result) {
				if (result && !result.error) {
					deferred.resolve(result);
				} else {
					deferred.reject(result);
				}
			};
			
			//Parse state parameter from Drive UI
			var state = $routeParams['state'];
			var folders = [];
			if(state) {
				state = JSON.parse(state);
				if(state.action === 'create') {
					folders = [{ id: state.folderId }];
				}
			}
			
			gapi.client.request({
				'path': '/drive/v2/files',
				'method': 'POST',
				'body': JSON.stringify({
					title: title,
					mimeType: 'application/vnd.google-apps.drive-sdk',
					parents: folders
				})
			}).execute(onComplete);
			return deferred.promise;
		};
		
		//Renames the current file in Drive. 
		this.renameFile = function(title, id) {
			gapi.client.request({
				'path': '/drive/v2/files/' + id,
				'method': 'PUT',
				'params': {
					'fields': '',
					'key': config.apiKey
				},
				'body': JSON.stringify({
					title: title
				})
			}).execute(function(){});
		};

		/**
		 * Checks to make sure the user is currently authorized and the access
		 * token hasn't expired.
		 *
		 * @param immediateMode
		 * @param userId
		 * @returns {angular.$q.promise}
		 */
		this.requireAuth = function (immediateMode, userId) {
			/* jshint camelCase: false */
			var token = gapi.auth.getToken();
			var now = Date.now() / 1000;
			if (token && ((token.expires_at - now) > (60))) {
				return $q.when(token);
			} else {
				var params = {
					'client_id': config.clientId,
					'scope': config.scopes,
					'immediate': immediateMode,
					'user_id': userId
				};
				var deferred = $q.defer();
				gapi.auth.authorize(params, function (result) {
					if (result && !result.error) {
						deferred.resolve(result);
					} else {
						deferred.reject(result);
					}
					$rootScope.$digest();
				});
				return deferred.promise;
			}
		};

		var this_ = this;
		/**
		 * Actually load a document. If the document is new, initializes
		 * the model with an empty list of todos.
		 *
		 * @param id
		 * @returns {angular.$q.promise}
		 */
		this.load = function (id) {
			var deferred = $q.defer();
			var initialize = function (model) {
				var pages = model.createMap();
				model.getRoot().set('pages', pages);
				//Initialize the main pages
				if(!this_.ideGraphical) {
					model.getRoot().set('graphical', false);
					pages.set('main', model.createString(PROJ_INIT_TEXT));
				}
				else {
					var root = model.getRoot();
					root.set('graphical', true);
					root.set('cglobals', model.createMap());
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
				model.getRoot().set('log', log);
				//Log entries are identified by timestamp, plus some random digits to avoid collisions
				var key = String(new Date().getTime() + Math.random());
				log.set(key, {
					user: 'Ethan DiNinno',
					title: 'Project created',
					content: ''
				});
			};
			var onLoad = function (document) {
				this.setDocument(id, document);
				var model = document.getModel()
				Blockly.Realtime.model_ = model;
				Blockly.zr_cpp.C_GLOBAL_VARS = model.getRoot().get('cglobals');
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
	}]
);
