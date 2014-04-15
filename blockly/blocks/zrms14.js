/**
 * Visual Blocks Editor
 *
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
 * @fileoverview Blocks for basic ZR C++ API.
 * @author dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.Blocks.zrms14');

goog.require('Blockly.Blocks');

Blockly.Blocks['zrms14_getDebrisLocation'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('getDebrisLocation');
		this.appendValueInput('debrisId')
			.appendField('id:')
			.setCheck('number');
		this.appendValueInput('loc')
			.appendField('array:')
			.setCheck('array');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_haveDebris'] = {
	init: function() {
		var PLAYERS =
			[['Me', 'ME'],
			 ['Opponent', 'OTHER']];
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('haveDebris');
		this.appendDummyInput()
			.appendField('player:')
			.appendField(new Blockly.FieldDropdown(PLAYERS), 'player');
		this.appendValueInput('debrisId')
			.appendField('id:')
			.setCheck('number');
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_startLasso'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('startLasso');
		this.appendValueInput('debrisId')
			.appendField('id:')
			.setCheck('number');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_haveItem'] = {
	init: function() {
		var PLAYERS =
			[['Me', 'ME'],
			 ['Opponent', 'OTHER']];
		var ITEMS = 
			[['0', '0'],
			 ['1', '1']];
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('haveItem');
		this.appendDummyInput()
			.appendField('player:')
			.appendField(new Blockly.FieldDropdown(PLAYERS), 'player');
		this.appendDummyInput()
			.appendField('item:')
			.appendField(new Blockly.FieldDropdown(ITEMS), 'objectNum');
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_getCometState'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('getCometState');
		this.appendValueInput('dtSteps')
			.appendField('steps:')
			.setCheck('number');
		this.appendValueInput('state')
			.appendField('array:')
			.setCheck('array');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};