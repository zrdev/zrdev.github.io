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
		var DEBRIS = 
			[['1', '1'],
			 ['2', '2'],
			 ['3', '3'],
			 ['4', '4'],
			 ['5', '5'],
			 ['6', '6'],
			 ['7', '7'],
			 ['8', '8']];
		this.setHelpUrl('');
		this.setColour(20);
		this.appendValueInput('debrisId')
			.appendField('location of debris:')
			.appendField(new Blockly.FieldDropdown(DEBRIS), 'debrisId');
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
		var DEBRIS = 
			[['1', '1'],
			 ['2', '2'],
			 ['3', '3'],
			 ['4', '4'],
			 ['5', '5'],
			 ['6', '6'],
			 ['7', '7'],
			 ['8', '8']];
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('player:')
			.appendField(new Blockly.FieldDropdown(PLAYERS), 'player');
		this.appendDummyInput()
			.appendField('has debris:')
			.appendField(new Blockly.FieldDropdown(DEBRIS), 'debrisId');
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_startLasso'] = {
	init: function() {
		var DEBRIS = 
			[['1', '1'],
			 ['2', '2'],
			 ['3', '3'],
			 ['4', '4'],
			 ['5', '5'],
			 ['6', '6'],
			 ['7', '7'],
			 ['8', '8']];
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('start lasso on debris:')
			.appendField(new Blockly.FieldDropdown(DEBRIS), 'debrisId');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_havePack'] = {
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
			.appendField('player:')
			.appendField(new Blockly.FieldDropdown(PLAYERS), 'player');
		this.appendDummyInput()
			.appendField('has item:')
			.appendField(new Blockly.FieldDropdown(ITEMS), 'objectNum');
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_predictCometState'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('predictCometState');
		this.appendValueInput('dtSteps')
			.appendField('steps:')
			.setCheck('number');
		this.appendValueInput('initState')
			.appendField('initial state:')
			.setCheck('array');
		this.appendValueInput('finalState')
			.appendField('final state:')
			.setCheck('array');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
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

Blockly.Blocks['zrms14_faceTarget'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('faceTarget');
		this.appendValueInput('target')
			.appendField('target:')
			.setCheck('array');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_isFacingTarget'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('I am facing my comet')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_shootLaserBool'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('shoot laser')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_shootLaserVoid'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('shoot laser');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_laserShotsRemaining'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('laser shots remaining')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_getMass'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('my mass')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_getFuelRemaining'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('my remaining fuel')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_getScore'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('my score')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_getOtherScore'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('opponent\'s score')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_isSlowDownActive'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('slowdown is active')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['zrms14_isBounceActive'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(20);
		this.appendDummyInput()
			.appendField('bounce is active')
		this.setOutput(true, 'number');
		this.setTooltip('');
		this.setInputsInline(true);
	},
	onchange: Blockly.Blocks.requireInFunction,
};