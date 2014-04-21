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

//Handles Drive files and APIs. 
zr.service('drive', ['config', '$modal', '$timeout', '$location', 'realtime', 'zrdb',

	function (config, $modal, $timeout, $location, realtime, zrdb) {
		
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

		//Renames the current file in Drive. 
		this.renameFile = function(title, id, callback) {
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
			}).execute(function(){
				fileMetadata.title = title;
				callback();
			});
		};
		
		var fileMetadata = null;
		//Gets the metadata of a file in Drive. 
		this.getFileMetadata = function(id, callback) {
			if(fileMetadata && fileMetadata.id === id) {
				callback(fileMetadata);
				return;
			}
			else {
				gapi.client.request({
					'path': '/drive/v2/files/' + id,
					'method': 'GET'
				}).execute(function(data) {
					fileMetadata = data;
					callback(data);
				});
			}
		};

		
		//Opens new project modal. 
		this.newProject = function(folder) {
			realtime.requireAuth().then(function () {
				$modal.open({
					templateUrl: '/partials/new-project-modal.html',
					controller: 'NewProjectModalController',
					resolve: {
						folder: function() { return folder; },
						gameResources: function() {
							return zrdb.getAllResources('game');
						}
					}
				});
			});
		};
		
		this.openProject = function() {
			realtime.requireAuth().then(function () {
				var pickerCallback = function(data) {
					if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
						var doc = data[google.picker.Response.DOCUMENTS][0];
						var id = doc[google.picker.Document.ID];
						$timeout(function() {
							$location.url('/ide/' + id + '/');
						});
					}
				};
				var showPicker = function() {
					var picker = new google.picker.PickerBuilder().
						enableFeature(google.picker.Feature.NAV_HIDDEN).
						hideTitleBar().
						setAppId(config.appId).
						setOAuthToken(gapi.auth.getToken().access_token).
						addView(new google.picker.DocsView().
							setParent('root').
							setMode(google.picker.DocsViewMode.LIST).
							setIncludeFolders(true).
							setMimeTypes('application/vnd.google-apps.drive-sdk.' + config.appId)).
						setCallback(pickerCallback).
						build();
					picker.setVisible(true);
				}
				if(!window.google || !window.google.picker) {
					gapi.load('picker', {"callback" : showPicker});
				}
				else {
					showPicker();
				}
			});
		};
	}]
);
