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
 * @fileoverview Variable and list blocks for Blockly. Modified for ZR C++ API.
 * @author fraser@google.com (Neil Fraser), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.Blocks.variables');

goog.require('Blockly.Blocks');


Blockly.Blocks['variables_get'] = {
	// Variable getter.
	init: function() {
		this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
		this.setColour(330);
		this.appendDummyInput()
				.appendField(Blockly.Msg.VARIABLES_GET_TITLE)
				.appendField(new Blockly.FieldVariable(' ', null, false), 'VAR')
				.appendField(Blockly.Msg.VARIABLES_GET_TAIL);
		this.setOutput(true, 'number');
		this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
		this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
		this.contextMenuType_ = 'variables_set';
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setFieldValue(newName, 'VAR');
		}
	},
	customContextMenu: function(options) {
		var option = {enabled: true};
		var name = this.getFieldValue('VAR');
		option.text = this.contextMenuMsg_.replace('%1', name);
		var xmlField = goog.dom.createDom('field', null, name);
		xmlField.setAttribute('name', 'VAR');
		var xmlBlock = goog.dom.createDom('block', null, xmlField);
		xmlBlock.setAttribute('type', this.contextMenuType_);
		option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
		options.push(option);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['variables_array_get_pointer'] = {
	// Array getter.
	init: function() {
		this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
		this.setColour(260);
		this.appendDummyInput()
				.appendField(Blockly.Msg.VARIABLES_GET_TITLE)
				.appendField(new Blockly.FieldVariable(' ', null, true), 'VAR')
				.appendField(Blockly.Msg.VARIABLES_GET_TAIL);
		this.setOutput(true, 'array');
		this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
		this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
		this.contextMenuType_ = 'variables_set';
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setFieldValue(newName, 'VAR');
		}
	},
	customContextMenu: function(options) {
		var option = {enabled: true};
		var name = this.getFieldValue('VAR');
		option.text = this.contextMenuMsg_.replace('%1', name);
		var xmlField = goog.dom.createDom('field', null, name);
		xmlField.setAttribute('name', 'VAR');
		var xmlBlock = goog.dom.createDom('block', null, xmlField);
		xmlBlock.setAttribute('type', this.contextMenuType_);
		option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
		options.push(option);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['variables_set'] = {
	// Variable setter.
	init: function() {
		this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
		this.setColour(330);
		this.interpolateMsg(
				// TODO: Combine these messages instead of using concatenation.
				'%1 = %2',
				['VAR', new Blockly.FieldVariable(' ', null, false)],
				['VALUE', null, Blockly.ALIGN_RIGHT],
				Blockly.ALIGN_RIGHT);
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
		this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
		this.contextMenuType_ = 'variables_get';
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setFieldValue(newName, 'VAR');
		}
	},
	customContextMenu: Blockly.Blocks['variables_get'].customContextMenu,
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['variables_declare'] = {
	// Global variable declaration
	init: function() {
		this.setColour(330);
		this.appendDummyInput()
				.appendField('type:')
				.appendField(new Blockly.FieldDropdown(Blockly.zr_cpp.C_VARIABLE_TYPES), 'TYPE')
				.appendField('name:')
				.appendField(new Blockly.FieldTextInput('myVariable', this.validator), 'NAME')
				.appendField('initial value:')
				.appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'VALUE');
		this.setPreviousStatement(true, 'declare');
		this.setNextStatement(true, 'declare');
		this.setTooltip('');
	},
	validator: function(newVar) {
		// Merge runs of whitespace.  Strip leading and trailing whitespace.
		// Beyond this, all names are legal.
		newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
		return newVar || null;
	},
	onchange: function() {
		if (!this.workspace) {
			// Block has been deleted.
			return;
		}
		if(Blockly.Realtime.enabled_ && !Blockly.Realtime.initializing && !this.isInFlyout) {
			if(this.getSurroundParent()) {
				Blockly.zr_cpp.C_GLOBAL_VARS.set(String(this.id), {
					type: this.getFieldValue('TYPE'),
					name: this.getFieldValue('NAME'),
					isArray: 'FALSE',
				});
			}
		}
		if (this.getSurroundParent()) {
			this.setWarningText(null);
		} else {
			this.setWarningText('Place this block inside the global variables block.');
		}
	},
	beforedispose: function() {
		if(!Blockly.Realtime.enabled_ || this.isInFlyout) {
			return;
		}
		Blockly.zr_cpp.C_GLOBAL_VARS.delete(String(this.id));
	}
};


Blockly.Blocks['variables_array_get'] = {
	// Get element at index.
	init: function() {
		this.setHelpUrl(Blockly.Msg.LISTS_GET_INDEX_HELPURL);
		this.setColour(260);
		this.appendDummyInput()
				.appendField(new Blockly.FieldVariable(' ', null, true),'ARRAY')
				.appendField('[');
		this.appendValueInput('INDEX');
		this.appendDummyInput()
				.appendField(']');
		this.setInputsInline(true);
		this.setOutput(true, 'number');
		this.setTooltip(Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FROM_START);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['variables_array_set'] = {
	// Set element at index.
	init: function() {
		this.setHelpUrl('');
		this.setColour(260);
		this.appendDummyInput()
				.appendField(new Blockly.FieldVariable(' ', null, true),'ARRAY')
				.appendField('[');
		this.appendValueInput('INDEX')
				.setCheck('number');
		this.appendDummyInput()
				.appendField('] =');
		this.appendValueInput('VALUE')
				.setCheck('number');
		this.setInputsInline(true);
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['variables_array_declare'] = {
	// Global array declaration
	init: function() {
		this.setColour(260);
		this.appendDummyInput('INPUTS')
				.appendField('type:')
				.appendField(new Blockly.FieldDropdown(Blockly.zr_cpp.C_VARIABLE_TYPES), 'TYPE')
				.appendField('name:')
				.appendField(new Blockly.FieldTextInput('myArray', this.validator), 'NAME')
				.appendField('length:')
				.appendField(new Blockly.FieldTextInput('1', this.adjustInputs), 'LENGTH')
				.appendField('initial value:')
				.appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'VALUE0');
		this.setInputsInline(true);
		this.setPreviousStatement(true, 'declare');
		this.setNextStatement(true,'declare');
		this.setTooltip('');
	},
	getGlobals: function() {
		//Has different name from getVars so the variable will not be double counted
		return {
			type: this.getFieldValue('TYPE'),
			name: this.getFieldValue('NAME'),
			length: this.getFieldValue('LENGTH'),
			isArray: 'TRUE',
		}
	},
	adjustInputs: function(text) {
		var len = parseInt(text);
		if(isNaN(len) || len < 1) {
			len = 1;
		}
		var block = this.sourceBlock_;
		if(block.inputList !== void 0) { //inputList will not yet be initialized on the first call
			var oldlen = block.getFieldValue('LENGTH');
			var input = block.getInput('INPUTS');
			if(len < oldlen) {
				for (var i = len; i < oldlen; i++) {
					input.removeField('VALUE' + i);
					input.removeField('SPACE' + i);
				}
				block.render();
			}
			else if(len > oldlen) {
				for(var j = oldlen; j < len; j++) {
					input.appendField(',', 'SPACE' + j)
							.appendField(new Blockly.FieldTextInput('0', Blockly.FieldTextInput.numberValidator), 'VALUE' + j);
				}
			}
		}
		return '' + len; //Cast to string
	},
	validator: Blockly.Blocks['variables_declare'].validator,
	onchange: function() {
		if (!this.workspace) {
			// Block has been deleted.
			return;
		}
		if(Blockly.Realtime.enabled_ && !Blockly.Realtime.initializing && !this.isInFlyout) {
			if(this.getSurroundParent()) {
				Blockly.zr_cpp.C_GLOBAL_VARS.set(String(this.id), {
					type: this.getFieldValue('TYPE'),
					name: this.getFieldValue('NAME'),
					length: this.getFieldValue('LENGTH'),
					isArray: 'TRUE',
				});
			}
		}
		if (this.getSurroundParent()) {
			this.setWarningText(null);
		} else {
			this.setWarningText('Place this block inside the global variables block.');
		}
	},
	beforedispose: function() {
		if(!Blockly.Realtime.enabled_ || this.isInFlyout) {
			return;
		}
		Blockly.zr_cpp.C_GLOBAL_VARS.delete(String(this.id));
	}
};
