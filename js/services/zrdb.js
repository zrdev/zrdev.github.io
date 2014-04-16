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
zr.service('zrdb', ['config', '$http', '$timeout', '$route',

	function (config, $http, $timeout, $route) {

		var cache = {};
		var completeTables = {};
		
		this.getSingleResource = function(name, id) {
			id = id || $route.current.params['id'];
			id = parseInt(id);
			if(name in cache) {
				var all = cache[name];
				for(var i = all.length; i--; ) {
					if(all[i].id === id) {
						return {
							data: all[i]
						};
					}
				}
			}
			return $http.get(config.serviceDomain + '/' + name + 'resource/single/' + id)
			.success(function(data) {
				if(!(name in cache)) {
					cache[name] = [];
				}
				cache[name][id] = data;
				return data;
			})
			.error(function() {
				alert('Could not retrieve data from ZR server.')
				return null;
			});
		};

		this.getAllResources = function(name) {
			if(name in completeTables) {
				return {
					data: {
						rows: cache[name]
					}
				}
			}
			return $http.get(config.serviceDomain + '/' + name + 'resource/all/')
			.success(function(data) {
				cache[name] = data.rows;
				completeTables[name] = true;
				return data.rows;
			})
			.error(function() {
				alert('Could not retrieve game data.');
				return null;
			});
		};

	}]
);
