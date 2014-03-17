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
 * @fileoverview Math blocks for Blockly. Modified for ZR C++ API.
 * @author q.neutron@gmail.com (Quynh Neutron), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.Blocks.math');

goog.require('Blockly.Blocks');

Blockly.Blocks['math_number'] = {
	// Numeric value.
	init: function() {
		this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
		this.setColour(230);
		this.appendDummyInput()
				.appendField(new Blockly.FieldTextInput('0',
				Blockly.FieldTextInput.numberValidator), 'NUM');
		this.setOutput(true, 'number');
		this.setTooltip(Blockly.Msg.MATH_NUMBER_TOOLTIP);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['math_arithmetic'] = {
	// Basic arithmetic operator.
	init: function() {
		var OPERATORS =
				[['+', 'ADD'],
				 ['-', 'MINUS'],
				 ['*', 'MULTIPLY'],
				 ['/', 'DIVIDE'],
				 ['^', 'POWER']];
		this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
		this.setColour(230);
		this.setOutput(true, 'number');
		this.appendValueInput('A')
				.setCheck('number');
		this.appendValueInput('B')
				.setCheck('number')
				.appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
		this.setInputsInline(true);
		// Assign 'this' to a variable for use in the tooltip closure below.
		var thisBlock = this;
		this.setTooltip(function() {
			var mode = thisBlock.getFieldValue('OP');
			var TOOLTIPS = {
				ADD: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
				MINUS: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
				MULTIPLY: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
				DIVIDE: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE,
				POWER: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER
			};
			return TOOLTIPS[mode];
		});
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['math_single'] = {
	// Advanced math operators with single operand.
	init: function() {
		var OPERATORS =
				[['square root', 'sqrtf'],
				 ['absolute value', 'fabsf'],
				 ['-', '-'],
				 ['ln', 'logf'],
				 ['log10', 'log10f'],
				 ['e^', 'expf']];
		this.setHelpUrl(Blockly.Msg.MATH_SINGLE_HELPURL);
		this.setColour(230);
		this.setOutput(true, 'number');
		this.interpolateMsg('%1 %2',
				['OP', new Blockly.FieldDropdown(OPERATORS)],
				['NUM', 'number', Blockly.ALIGN_RIGHT],
				Blockly.ALIGN_RIGHT);
		// Assign 'this' to a variable for use in the tooltip closure below.
		var thisBlock = this;
		this.setTooltip(function() {
			var mode = thisBlock.getFieldValue('OP');
			var TOOLTIPS = {
				ROOT: Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT,
				ABS: Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS,
				NEG: Blockly.Msg.MATH_SINGLE_TOOLTIP_NEG,
				LN: Blockly.Msg.MATH_SINGLE_TOOLTIP_LN,
				LOG10: Blockly.Msg.MATH_SINGLE_TOOLTIP_LOG10,
				EXP: Blockly.Msg.MATH_SINGLE_TOOLTIP_EXP,
				POW10: Blockly.Msg.MATH_SINGLE_TOOLTIP_POW10
			};
			return TOOLTIPS['ROOT'];
		});
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['math_trig'] = {
	// Trigonometry operators.
	init: function() {
		var OPERATORS =
				[['sin', 'sinf'],
				 ['cos', 'cosf'],
				 ['tan', 'tanf'],
				 ['arcsin', 'asinf'],
				 ['arccos', 'acosf'],
				 ['arctan', 'atanf']];
		this.setHelpUrl(Blockly.Msg.MATH_TRIG_HELPURL);
		this.setColour(230);
		this.setOutput(true, 'number');
		this.appendValueInput('NUM')
				.setCheck('number')
				.appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
		// Assign 'this' to a variable for use in the tooltip closure below.
		var thisBlock = this;
		this.setTooltip(function() {
			var mode = thisBlock.getFieldValue('OP');
			var TOOLTIPS = {
				SIN: Blockly.Msg.MATH_TRIG_TOOLTIP_SIN,
				COS: Blockly.Msg.MATH_TRIG_TOOLTIP_COS,
				TAN: Blockly.Msg.MATH_TRIG_TOOLTIP_TAN,
				ASIN: Blockly.Msg.MATH_TRIG_TOOLTIP_ASIN,
				ACOS: Blockly.Msg.MATH_TRIG_TOOLTIP_ACOS,
				ATAN: Blockly.Msg.MATH_TRIG_TOOLTIP_ATAN
			};
			return TOOLTIPS['SIN'];
		});
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['math_constant'] = {
	// Constants
	init: function() {
		//These macros are defined in spheres_constants.h
		var CONSTANTS =
				[['\u03c0', 'PI'],
				 ['\u03c0/2', 'PI2'],
				 ['\u03c0/3', 'PI3'],
				 ['\u03c0/4', 'PI4'],
				 ['deg2rad', 'DEG2RAD'],
				 ['rad2deg', 'RAD2DEG']];
		this.setHelpUrl(Blockly.Msg.MATH_CONSTANT_HELPURL);
		this.setColour(230);
		this.setOutput(true, 'number');
		this.appendDummyInput()
				.appendField(new Blockly.FieldDropdown(CONSTANTS), 'CONSTANT');
		this.setTooltip(Blockly.Msg.MATH_CONSTANT_TOOLTIP);
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['math_change'] = {
	// Add to a variable in place.
	init: function() {
		this.setHelpUrl(Blockly.Msg.MATH_CHANGE_HELPURL);
		this.setColour(230);
		this.appendDummyInput().appendField('increment');
		this.appendValueInput('VAR')
				.setCheck('number');
		this.appendDummyInput().appendField('by');
		this.appendValueInput('DELTA')
				.setCheck('number');
		this.setPreviousStatement(true, 'statement');
		this.setNextStatement(true, 'statement');
		this.setInputsInline(true);
		// Assign 'this' to a variable for use in the tooltip closure below.
		var thisBlock = this;
		this.setTooltip(function() {
			return Blockly.Msg.MATH_CHANGE_TOOLTIP.replace('%1',
					thisBlock.getFieldValue('VAR'));
		});
	},
	getVars: function() {
		return [this.getFieldValue('VAR')];
	},
	renameVar: function(oldName, newName) {
		if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
			this.setFieldValue(newName, 'VAR');
		}
	},
	onchange: Blockly.Blocks.requireInFunction,
};

Blockly.Blocks['math_round'] = {
	// Rounding functions.
	init: function() {
		var OPERATORS =
				[['round to nearest', 'roundf'],
				 ['round up', 'ceilf'],
				 ['round down', 'floorf']];
		this.setHelpUrl(Blockly.Msg.MATH_ROUND_HELPURL);
		this.setColour(230);
		this.setOutput(true, 'number');
		this.appendValueInput('NUM')
				.setCheck('number')
				.appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
		this.setTooltip(Blockly.Msg.MATH_ROUND_TOOLTIP);
	},
	onchange: Blockly.Blocks.requireInFunction,
};


Blockly.Blocks['math_modulo'] = {
	// Remainder of a division.
	init: function() {
		this.setHelpUrl(Blockly.Msg.MATH_MODULO_HELPURL);
		this.setColour(230);
		this.setOutput(true, 'number');
		this.interpolateMsg('remainder of %1 / %2',
												['DIVIDEND', 'number', Blockly.ALIGN_RIGHT],
												['DIVISOR', 'number', Blockly.ALIGN_RIGHT],
												Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setTooltip(Blockly.Msg.MATH_MODULO_TOOLTIP);
	},
	onchange: Blockly.Blocks.requireInFunction,
};
