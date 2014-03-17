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

goog.provide('Blockly.Blocks.zr-base-api');

goog.require('Blockly.Blocks');

Blockly.Blocks['spheres_setPos'] = {
	init: function() {
		this.setHelpUrl('');
		this.setColour(65);
		this.interpolateMsg(
				'setPos %1, %2, %3',
				['X', 'number', Blockly.ALIGN_RIGHT],
				['Y', 'number', Blockly.ALIGN_RIGHT],
				['Z', 'number', Blockly.ALIGN_RIGHT],
				Blockly.ALIGN_RIGHT);
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['spheres_setTarget'] = {
	init: function() {
		var FUNCTIONS =
			[['set PositionTarget', 'api.setPositionTarget'],
			 ['set AttitudeTarget', 'api.setAttitudeTarget'],
			 ['set VelocityTarget', 'api.setVelocityTarget'],
			 ['set AttRateTarget', 'api.setAttRateTarget'],
			 ['set Forces', 'api.setForces'],
			 ['set Torques', 'api.setTorques']];
		this.setHelpUrl('');
		this.setColour(65);
		this.appendValueInput('ARGUMENT')
			.appendField(new Blockly.FieldDropdown(FUNCTIONS), 'FUNCTION')
			.setCheck('array');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['spheres_getZRState'] = {
	init: function() {
		var FUNCTIONS =
			[['get My ZRState', 'api.getMyZRState'],
			 ['get Other ZRState', 'api.getOtherZRState']];
		this.setHelpUrl('');
		this.setColour(65);
		this.appendValueInput('ARGUMENT')
			.appendField(new Blockly.FieldDropdown(FUNCTIONS), 'FUNCTION')
			.setCheck('array');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip('');
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['spheres_getTime'] = {
	// Variable getter.
	init: function() {
		this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
		this.setColour(65);
		this.appendDummyInput()
				.appendField('getTime');
		this.setOutput(true, 'number');
		this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
	},
	onchange: Blockly.Blocks.requireInFunction,
};
