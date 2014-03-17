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
 * @fileoverview Text blocks for Blockly. Modified for ZR C++ API.
 * @author fraser@google.com (Neil Fraser), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.Blocks.debug');

goog.require('Blockly.Blocks');


Blockly.Blocks['debug_string'] = {
	// Text value.
	init: function() {
		this.setHelpUrl(Blockly.Msg.TEXT_TEXT_HELPURL);
		this.setColour(160);
		this.appendDummyInput()
			.appendField(new Blockly.FieldTextInput('""'), 'TEXT');
		this.setOutput(true, 'string');
		this.setTooltip(Blockly.Msg.TEXT_TEXT_TOOLTIP);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['debug'] = {
	// Print statement.
	init: function() {
		this.setHelpUrl(Blockly.Msg.TEXT_PRINT_HELPURL);
		this.setColour(160);
		this.interpolateMsg('DEBUG %1',
			['TEXT', 'string', Blockly.ALIGN_RIGHT],
			Blockly.ALIGN_RIGHT);
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setTooltip(Blockly.Msg.TEXT_PRINT_TOOLTIP);
	},
	onchange: Blockly.Blocks.requireInFunction,
};
