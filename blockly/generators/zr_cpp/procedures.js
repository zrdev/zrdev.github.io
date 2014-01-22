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
 * @fileoverview Generating JavaScript for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.zr_cpp.procedures');

goog.require('Blockly.zr_cpp');


Blockly.zr_cpp['procedures_defreturn'] = function(block) {
	// Define a procedure with a return value.
	var funcName = Blockly.zr_cpp.variableDB_.getName(
			block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
	var branch = Blockly.zr_cpp.statementToCode(block, 'STACK');
	var type = block.getFieldValue('TYPE') || 'void';
	var returnValue = Blockly.zr_cpp.valueToCode(block, 'RETURN',
			Blockly.zr_cpp.ORDER_NONE) || '';
	if (returnValue) {
		returnValue = '  return ' + returnValue + ';\n';
	}
	var code = type + ' ' + funcName + block.getArgString(true) + ' {\n' +
			branch + returnValue + '}';
	code = Blockly.zr_cpp.scrub_(block, code);
	Blockly.zr_cpp.definitions_[funcName] = code;
	return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.zr_cpp['procedures_defnoreturn'] =
		Blockly.zr_cpp['procedures_defreturn'];

Blockly.zr_cpp['procedures_definit'] = function(block) {
	// Define a procedure with a return value.
	var branch = Blockly.zr_cpp.statementToCode(block, 'GLOBALS') + Blockly.zr_cpp.statementToCode(block, 'STACK');
	var code = 'void init() {\n' +
			branch + '}';
	code = Blockly.zr_cpp.scrub_(block, code);
	Blockly.zr_cpp.definitions_['init'] = code;
	return null;
};

Blockly.zr_cpp['procedures_defloop'] = function(block) {
	// Define a procedure with a return value.
	var branch = Blockly.zr_cpp.statementToCode(block, 'STACK');
	var code = 'void loop() {\n' +
			branch + '}';
	code = Blockly.zr_cpp.scrub_(block, code);
	Blockly.zr_cpp.definitions_['loop'] = code;
	return null;
};

Blockly.zr_cpp['procedures_callreturn'] = function(block) {
	// Call a procedure with a return value.
	var funcName = Blockly.zr_cpp.variableDB_.getName(
			block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
	var args = [];
	for (var x = 0; x < block.arguments_.length; x++) {
		args[x] = Blockly.zr_cpp.valueToCode(block, 'ARG' + x,
				Blockly.zr_cpp.ORDER_COMMA) || 'null';
	}
	var code = funcName + '(' + args.join(', ') + ')';
	return [code, Blockly.zr_cpp.ORDER_FUNCTION_CALL];
};

Blockly.zr_cpp['procedures_callnoreturn'] = function(block) {
	// Call a procedure with no return value.
	var funcName = Blockly.zr_cpp.variableDB_.getName(
			block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
	var args = [];
	for (var x = 0; x < block.arguments_.length; x++) {
		args[x] = Blockly.zr_cpp.valueToCode(block, 'ARG' + x,
				Blockly.zr_cpp.ORDER_COMMA) || 'null';
	}
	var code = funcName + '(' + args.join(', ') + ');\n';
	return code;
};

Blockly.zr_cpp['procedures_ifreturn'] = function(block) {
	// Conditionally return value from a procedure.
	var condition = Blockly.zr_cpp.valueToCode(block, 'CONDITION',
			Blockly.zr_cpp.ORDER_NONE) || 'false';
	var code = 'if (' + condition + ') {\n';
	if (block.hasReturnValue_) {
		var value = Blockly.zr_cpp.valueToCode(block, 'VALUE',
				Blockly.zr_cpp.ORDER_NONE) || 'null';
		code += '  return ' + value + ';\n';
	} else {
		code += '  return;\n';
	}
	code += '}\n';
	return code;
};
