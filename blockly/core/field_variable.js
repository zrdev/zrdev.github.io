/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 * and 2014 Massachusetts Institute of Technology
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
 * @fileoverview Variable input field. Modified for ZR C++ variable scoping. 
 * @author fraser@google.com (Neil Fraser), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.FieldVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.Variables');


/**
 * Class for a variable's dropdown field.
 * @param {!string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.  Its
 *     return value is ignored.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariable = function(varname, opt_changeHandler, showArrays) {
	this.showArrays_ = showArrays;

	Blockly.FieldVariable.superClass_.constructor.call(this,
			Blockly.FieldVariable.dropdownCreate, opt_changeHandler);

	if (varname) {
		this.setValue(varname);
	} else {
		this.setValue(Blockly.Variables.generateUniqueName());
	}
};
goog.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);

/**
 * Clone this FieldVariable.
 * @return {!Blockly.FieldVariable} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldVariable.prototype.clone = function() {
	return new Blockly.FieldVariable(this.getValue(), this.changeHandler_);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldVariable.prototype.getValue = function() {
	return this.getText();
};

/**
 * Set the variable name.
 * @param {string} text New text.
 */
Blockly.FieldVariable.prototype.setValue = function(text) {
	this.value_ = text;
	this.setText(text);
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
	var variableList = Blockly.Variables.allVariables();
	var len = variableList.length;
	if(len) {
		for (var i = len; i--; ) {
			if ((variableList[i].isArray === 'TRUE') === this.showArrays_) {
				variableList[i] = variableList[i].name;
			}
			else {
				//If the variable is not the appropriate type (array or not), remove it
				variableList.splice(i, 1);
			}
		}
	}
	// Ensure that the currently selected variable is an option.
	var name = this.getText();
	if (name && variableList.indexOf(name) == -1) {
		variableList.push(name);
	}
	if(!variableList.length) {
		variableList.push('');
	}
	variableList.sort(goog.string.caseInsensitiveCompare);
	// Variables are not language-specific, use the name as both the user-facing
	// text and the internal representation.
	var options = [];
	for (var x = 0; x < variableList.length; x++) {
		options[x] = [variableList[x], variableList[x]];
	}
	return options;
};
