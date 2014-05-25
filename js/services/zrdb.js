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
zr.service('zrdb', ['config', '$http', '$timeout', '$route', '$q',

	function (config, $http, $timeout, $route, $q) {

		var cache = {};
		var completeTables = {};
		var CONNECTION_ERROR = 'The server did not respond. Please check your Internet connection and try again.'
				+ 'If this problem persists for more than a few minutes, please contact us at zerorobotics@mit.edu.'
		var reqConfig = {
			headers: {}
		}

		//Auth check for views that require it
		this.checkAuth = function() {
			var token = gapi.auth.getToken();
			if(token && token.status.signed_in) {
				return $q.when();
			}
			else {
				window.authDeferred = $q.defer();
				gapi.auth.signIn();
				return window.authDeferred.promise.catch(function() {
					//If this is required, reload the page afterward
					$route.reload();
				});
			}
		};

		//Add a header w/ the OAuth token
		var refreshAuth = function() {
			if(gapi && gapi.auth && typeof gapi.auth.getToken === 'function' && gapi.auth.getToken() !== null) {
				reqConfig.headers['authorization'] = gapi.auth.getToken().access_token;
			}
		}
		
		this.getSingleResource = function(name, id, nocache) {
			id = id || $route.current.params['id'];
			id = parseInt(id);
			if(!nocache && name in cache) {
				var all = cache[name];
				for(var i = all.length; i--; ) {
					if(all[i].id === id) {
						//Return a promise and resolve it right away so the cache is transparent to the router
						return $q.when({
							data: all[i]
						});
					}
				}
			}
			refreshAuth();
			return $http.get(config.serviceDomain + '/' + name + 'resource/single/' + id + '/', reqConfig)
			.success(function(data) {
				if(!(name in cache)) {
					cache[name] = [];
				}
				if(!nocache) {
					cache[name].push(data);
				}
				return data;
			})
			.error(function() {
				alert(CONNECTION_ERROR);
				return null;
			});
		};

		this.putResource = function(name, id, resource, callback) {
			refreshAuth();
			return $http.post(config.serviceDomain + '/' + name + 'resource/edit/' + id + '/', resource, reqConfig)
			.success(function(data) {
				if(typeof callback === 'function') {
					callback();
				}
			})
			.error(function() {
				alert(CONNECTION_ERROR);
				return null;
			});
		};

		this.deleteResource = function(name, id, callback) {
			refreshAuth();
			return $http.post(config.serviceDomain + '/' + name + 'resource/delete/' + id + '/', {}, reqConfig)
			.success(function(data) {
				if(typeof callback === 'function') {
					callback();
				}
			})
			.error(function() {
				alert(CONNECTION_ERROR);
				return null;
			});
		};

		this.addResource = function(name, resource, callback) {
			refreshAuth();
			return $http.post(config.serviceDomain + '/' + name + 'resource/add/', resource, reqConfig)
			.success(function(data) {
				if(typeof callback === 'function') {
					callback();
				}
			})
			.error(function() {
				alert(CONNECTION_ERROR);
				return null;
			});
		};

		this.getAllResources = function(name) {
			if(name in completeTables) {
				//Return a promise and resolve it right away
				return $q.when({
					data: {
						rows: cache[name]
					}
				});
			}

			refreshAuth();

			return $http.get(config.serviceDomain + '/' + name + 'resource/all/', reqConfig)
			.success(function(data) {
				cache[name] = data.rows;
				completeTables[name] = true;
				return data.rows;
			})
			.error(function() {
				alert(CONNECTION_ERROR);
				return null;
			});
		};

		this.compile = function(data, simulate) {
			var deferred = $q.defer();

			var errorCallback = function() {
				alert(CONNECTION_ERROR);
				deferred.reject({
					message: CONNECTION_ERROR
				});
			};

			var getStatus = function(id) {
				$timeout(function() {
					$http.get(config.serviceDomain + (simulate ? '/simulation' : '/compilation') 
						+ 'resource/single/' + id, reqConfig)
					.success(function(data,status,headers,config) {
						if(data.status === 'COMPILING' || data.status === 'SIMULATING') {
							getStatus(id);
						}
						else if(data.status === 'SUCCEEDED') {
							//Cache the sim data
							if(simulate) {
								if(!('simulation' in cache)) {
									cache['simulation'] = [];
								}
								cache['simulation'].push(data);
							}
							deferred.resolve(data);
						}
						else if(data.status === 'FAILED') {
							deferred.reject(data);
						}
					})
					.error(errorCallback);
				}, 1000);
			};
			
			$http.post(config.serviceDomain + 
				(simulate ? '/simulationresource/simulate' : '/compilationresource/compile'), data, reqConfig)
			.success(function(data) {
				if(data.status === 'FAILED') {
					deferred.reject(data);
				}
				else {
					getStatus(data.id);
				}
			})
			.error(errorCallback);

			return deferred.promise;
		};

	}]
);
