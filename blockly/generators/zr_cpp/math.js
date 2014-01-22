/**
 * Visual Blocks Language
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
 * @fileoverview Generating C++ for math blocks. Modified from the standard Blockly JavaScript generator.
 * @author q.neutron@gmail.com (Quynh Neutron), dininno@mit.edu (Ethan DiNinno)
 */
'use strict';

goog.provide('Blockly.zr_cpp.math');

goog.require('Blockly.zr_cpp');

Blockly.zr_cpp['math_number'] = function(block) {
	// Numeric value.
	var code = block.getFieldValue('NUM');
	//Validate that the input starts with a number. parseFloat will correctly ignore the trailing f on single-precision floats.
	//TODO: better validation to make sure there isn't other crud after the number
	if(isNaN(parseFloat(code))) {
		code = '0';
	}
	return [code, Blockly.zr_cpp.ORDER_ATOMIC];
};

Blockly.zr_cpp['math_arithmetic'] = function(block) {
	// Basic arithmetic operators, and power.
	var OPERATORS = {
		ADD: [' + ', Blockly.zr_cpp.ORDER_ADDITION],
		MINUS: [' - ', Blockly.zr_cpp.ORDER_SUBTRACTION],
		MULTIPLY: [' * ', Blockly.zr_cpp.ORDER_MULTIPLICATION],
		DIVIDE: [' / ', Blockly.zr_cpp.ORDER_DIVISION],
		POWER: [null, Blockly.zr_cpp.ORDER_COMMA]  // Handle power separately.
	};
	var tuple = OPERATORS[block.getFieldValue('OP')];
	var operator = tuple[0];
	var order = tuple[1];
	var argument0 = Blockly.zr_cpp.valueToCode(block, 'A', order) || '0';
	var argument1 = Blockly.zr_cpp.valueToCode(block, 'B', order) || '0';
	var code;
	// Power requires a special case since it has no operator. The ZR libraries use all single-precision floats. 
	if (!operator) {
		code = 'powf(' + argument0 + ', ' + argument1 + ')';
		return [code, Blockly.zr_cpp.ORDER_FUNCTION_CALL];
	}
	code = argument0 + operator + argument1;
	return [code, order];
};

Blockly.zr_cpp['math_single'] = function(block) {
	// Math operators with single operand.
	var operator = block.getFieldValue('OP');
	var code;
	var arg;
	if (operator == '-') {
		// Negation is a special case given its different operator precedence.
		arg = Blockly.zr_cpp.valueToCode(block, 'NUM',
				Blockly.zr_cpp.ORDER_UNARY_NEGATION) || '0';
		if (arg[0] == '-') {
			// --3 is not legal
			arg = ' ' + arg;
		}
		code = '-' + arg;
		return [code, Blockly.zr_cpp.ORDER_UNARY_NEGATION];
	}
	arg = Blockly.zr_cpp.valueToCode(block, 'NUM',
			Blockly.zr_cpp.ORDER_NONE) || '0';
	// All ZR trig functions are single-precision and handled in radians, which makes most of the JS version of this unnecessary
	code = operator + '(' + arg + ')';
	return [code, Blockly.zr_cpp.ORDER_FUNCTION_CALL];
};

Blockly.zr_cpp['math_constant'] = function(block) {
	return [block.getFieldValue('CONSTANT'), Blockly.zr_cpp.ORDER_ATOMIC];
};

Blockly.zr_cpp['math_change'] = function(block) {
	// Add to a variable in place.
	var argument0 = Blockly.zr_cpp.valueToCode(block, 'DELTA',
			Blockly.zr_cpp.ORDER_ADDITION) || '0';
	var varName = Blockly.zr_cpp.variableDB_.getName(
			block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	return varName + ' += ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.zr_cpp['math_round'] = Blockly.zr_cpp['math_single'];
// Trigonometry functions have a single operand.
Blockly.zr_cpp['math_trig'] = Blockly.zr_cpp['math_single'];


Blockly.zr_cpp['math_modulo'] = function(block) {
	// Remainder computation.
	var argument0 = Blockly.zr_cpp.valueToCode(block, 'DIVIDEND',
			Blockly.zr_cpp.ORDER_MODULUS) || '0';
	var argument1 = Blockly.zr_cpp.valueToCode(block, 'DIVISOR',
			Blockly.zr_cpp.ORDER_MODULUS) || '0';
	var code = argument0 + ' % ' + argument1;
	return [code, Blockly.zr_cpp.ORDER_MODULUS];
};
