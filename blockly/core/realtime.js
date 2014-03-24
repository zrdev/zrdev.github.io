/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2014 Google Inc.
 * https://blockly.googlecode.com/
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
 * This file contains functions used by any Blockly app that wants to provide
 * realtime collaboration functionality.
 *
 * Note that it depends on the existence of particularly named UI elements.
 *
 * TODO: Inject the UI element names
 */

/**
 * @fileoverview Common support code for Blockly apps using realtime
 * collaboration.
 * Note that to use this you must set up a project via the Google Developers
 * Console. Instructions on how to do that can be found in the Blockly wiki page
 * at https://code.google.com/p/blockly/wiki/RealtimeCollaboration
 * Once you do that you can set the clientId in
 * Blockly.Realtime.realtimeOptions_
 * @author markf@google.com (Mark Friedman)
 */
'use strict';

goog.provide('Blockly.Realtime');

goog.require('goog.array');

/**
 * Is realtime collaboration enabled?
 * @type {boolean}
 * @private
 */
Blockly.Realtime.enabled_ = false;

/**
 * The Realtime model of this doc.
 * @type {gapi.drive.realtime.Model}
 * @private
 */
Blockly.Realtime.model_ = null;

Blockly.Realtime.initializing = false;

/**
 * The function used to initialize the UI after realtime is initialized.
 * @type {Function()}
 * @private
 */
Blockly.Realtime.initUi_ = function(){};

/**
 * A map from block id to blocks.
 * @type {gapi.drive.realtime.CollaborativeMap}
 * @private
 */
Blockly.Realtime.blocksMap_ = null;

/**
 * Are currently syncing from another instance of this realtime doc.
 * @type {boolean}
 */
Blockly.Realtime.withinSync = false;

/**
 * Indicator of whether we are in the context of an undo or redo operation.
 * @type {boolean}
 * @private
 */
Blockly.Realtime.withinUndo_ = false;


/**
 * Returns whether realtime collaboration is enabled.
 * @returns {boolean}
 */
Blockly.Realtime.isEnabled = function() {
	return Blockly.Realtime.enabled_;
};

/**
 * Delete a block from the realtime blocks map.
 * @param {!Blockly.Block} block The block to remove.
 */
Blockly.Realtime.removeBlock = function(block) {
	Blockly.Realtime.blocksMap_.delete(block.id.toString());
};

/**
 * Add to the list of top-level blocks.
 * @param {!Blockly.Block} block The block to add.
 */
Blockly.Realtime.addTopBlock = function(block) {
	if (Blockly.Realtime.topBlocks_.indexOf(block) == -1) {
		Blockly.Realtime.topBlocks_.push(block);
	}
};

/**
 * Delete a block from the list of top-level blocks.
 * @param {!Blockly.Block} block The block to remove.
 */
Blockly.Realtime.removeTopBlock = function(block) {
	Blockly.Realtime.topBlocks_.removeValue(block);
};

/**
 * Obtain a newly created block known by the Realtime API.
 * @param {!Blockly.Workspace} workspace The workspace to put the block in.
 * @param {string} prototypeName The name of the prototype for the block
 * @return {!Blockly.Block}
 */
Blockly.Realtime.obtainBlock = function(workspace, prototypeName) {
	var newBlock =
			Blockly.Realtime.model_.create(Blockly.Block, workspace, prototypeName);
	return newBlock;
};

/**
 * Get an existing block by id.
 * @param {string} id The block's id.
 * @return {Blockly.Block} The found block.
 */
Blockly.Realtime.getBlockById = function(id) {
	return Blockly.Realtime.blocksMap_.get(id);
};


/**
 * Log the event for debugging purposses.
 * @param {gapi.drive.realtime.BaseModelEvent} evt The event that occurred.
 * @private
 */
Blockly.Realtime.logEvent_ = function(evt) {
  console.log('Object event:');
  console.log('  id: ' + evt.target.id);
  console.log('  type: ' + evt.type);
  var events = evt.events;
  if (events) {
    var eventCount = events.length;
    for (var i = 0; i < eventCount; i++) {
      var event = events[i];
      console.log('  child event:');
      console.log('    id: ' + event.target.id);
      console.log('    type: ' + event.type);
    }
  }
};

/**
 * Event handler to call when a block is changed.
 * @param {!gapi.drive.realtime.ObjectChangedEvent} evt The event that occurred.
 * @private
 */
Blockly.Realtime.onObjectChange_ = function(evt) {
  var events = evt.events;
  var eventCount = evt.events.length;
  for (var i = 0; i < eventCount; i++) {
    var event = events[i];
    if (!event.isLocal || Blockly.Realtime.withinUndo_) {
      var block = event.target;
      if (event.type == 'value_changed') {
        if (event.property == 'xmlDom') {
          Blockly.Realtime.doWithinSync_(function() {
            Blockly.Realtime.placeBlockOnWorkspace_(block, false);
            Blockly.Realtime.moveBlock_(block);
          });
        } else if (event.property == 'relativeX' ||
            event.property == 'relativeY') {
          Blockly.Realtime.doWithinSync_(function() {
            if (!block.svg_) {
              // If this is a move of a newly disconnected (i.e newly top
              // level) block it will not have any svg (because it has been
              // disposed of by it's parent), so we need to handle that here.
              Blockly.Realtime.placeBlockOnWorkspace_(block, false);
            }
            Blockly.Realtime.moveBlock_(block);
          });
        }
      }
    }
  }
};

/**
 * Event handler to call when there is a change to the realtime blocks map.
 * @param {!gapi.drive.realtime.ValueChangedEvent} evt The event that occurred.
 * @private
 */
Blockly.Realtime.onBlocksMapChange_ = function(evt) {
  if (!evt.isLocal || Blockly.Realtime.withinUndo_) {
    var block = evt.newValue;
    if (block) {
      Blockly.Realtime.placeBlockOnWorkspace_(block, !(evt.oldValue));
    } else {
      block = evt.oldValue;
      Blockly.Realtime.deleteBlock(block);
    }
  }
};

/**
 * A convenient wrapper around code that synchronizes the local model being
 * edited with changes from another non-local model.
 * @param {!Function()} thunk A thunk of code to call.
 * @private
 */
Blockly.Realtime.doWithinSync_ = function(thunk) {
	if (Blockly.Realtime.withinSync) {
		thunk();
	} else {
		try {
			Blockly.Realtime.withinSync = true;
			thunk();
		} finally {
			Blockly.Realtime.withinSync = false;
		}
	}
};

/**
 * Places a block to be synced on this docs main workspace.  The block might
 * already exist on this doc, in which case it is updated and/or moved.
 * @param {!Blockly.Block} block The block.
 * @param {boolean} addToTop Whether to add the block to the workspace/s list of
 *     top-level blocks.
 * @private
 */
Blockly.Realtime.placeBlockOnWorkspace_ = function(block, addToTop) {
	Blockly.Realtime.doWithinSync_(function() {
		var blockDom = Blockly.Xml.textToDom(block.xmlDom).firstChild;
		var newBlock =
				Blockly.Xml.domToBlock(Blockly.mainWorkspace, blockDom, true);
		// TODO: The following is for debugging.  It should never actually happen.
		if (!newBlock) {
			return;
		}
		// Since Blockly.Xml.blockDomToBlock() purposely won't add blocks to
		// workspace.topBlocks_ we sometimes need to do it explicitly here.
		if (addToTop) {
			newBlock.workspace.addTopBlock(newBlock);
		}
		if (addToTop ||
				goog.array.contains(Blockly.Realtime.topBlocks_, newBlock)) {
			Blockly.Realtime.moveBlock_(newBlock);
		}
	});
};

/**
 * Move a block
 * @param {Blockly.Block} block The block to move.
 * @private
 */
Blockly.Realtime.moveBlock_ = function(block) {
	if (!isNaN(block.relativeX) && !isNaN(block.relativeY)) {
		var width = Blockly.svgSize().width;
		var curPos = block.getRelativeToSurfaceXY();
		var dx = block.relativeX - curPos.x;
		var dy = block.relativeY - curPos.y;
		block.moveBy(Blockly.RTL ? width - dx : dx, dy);
	}
};

/**
 * Delete a block.
 * @param {!Blockly.Block} block The block to delete.
 * @private
 */
Blockly.Realtime.deleteBlock = function(block) {
	Blockly.Realtime.doWithinSync_(function() {
		block.dispose(true, true, true);
	});
};

/**
 * Load all the blocks from the realtime model's blocks map and place them
 * appropriately on the main Blockly workspace.
 * @private
 */
Blockly.Realtime.loadBlocks_ = function() {
	var topBlocks = Blockly.Realtime.topBlocks_;
	for (var j = 0; j < topBlocks.length; j++) {
		var topBlock = topBlocks.get(j);
		Blockly.Realtime.placeBlockOnWorkspace_(topBlock, true);
	}
};

/**
 * Cause a changed block to update the realtime model, and therefore to be
 * synced with other apps editing this same doc.
 * @param {!Blockly.Block} block The block that changed.
 */
Blockly.Realtime.blockChanged = function(block) {
	if (block.workspace == Blockly.mainWorkspace &&
      Blockly.Realtime.isEnabled() &&
      !Blockly.Realtime.withinSync) {
		var rootBlock = block.getRootBlock();
		var xy = rootBlock.getRelativeToSurfaceXY();
		var changed = false;
		var xml = Blockly.Xml.blockToDom_(rootBlock);
		xml.setAttribute('id', rootBlock.id);
		var topXml = goog.dom.createDom('xml');
		topXml.appendChild(xml);
		var newXml = Blockly.Xml.domToText(topXml);
		if (newXml != rootBlock.xmlDom) {
			changed = true;
			rootBlock.xmlDom = newXml;
		}
		if (rootBlock.relativeX != xy.x || rootBlock.relativeY != xy.y){
			rootBlock.relativeX = xy.x;
			rootBlock.relativeY = xy.y;
			changed = true;
		}
		if (changed) {
			var blockId = rootBlock.id.toString();
			Blockly.Realtime.blocksMap_.set(blockId, rootBlock);
		}
	}
};

//Load a project page
Blockly.Realtime.loadPage = function(pageRoot) {
	//Destroy old listeners before wiping workspace
	if(Blockly.Realtime.blocksMap_) {
		Blockly.Realtime.blocksMap_.removeEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED,
				Blockly.Realtime.onBlocksMapChange_);
	}
	Blockly.Realtime.model_.getRoot().removeEventListener(
			gapi.drive.realtime.EventType.OBJECT_CHANGED,
			Blockly.Realtime.onObjectChange_);

	//Remove all blocks from GUI
	Blockly.Realtime.enabled_ = false;
	Blockly.mainWorkspace.clear();
	Blockly.Realtime.enabled_ = true;
	
	
	//Initialize new Realtime page
	Blockly.Realtime.topBlocks_ =
			pageRoot.get('topBlocks');
	Blockly.Realtime.blocksMap_ =
			pageRoot.get('blocks');
	Blockly.Realtime.blocksMap_.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED,
			Blockly.Realtime.onBlocksMapChange_);
	Blockly.Realtime.model_.getRoot().addEventListener(
			gapi.drive.realtime.EventType.OBJECT_CHANGED,
			Blockly.Realtime.onObjectChange_);

	Blockly.Realtime.initUi_();
	
	Blockly.Realtime.initializing = true; //Flag to suppress block adjusters
	Blockly.Realtime.loadBlocks_();
	Blockly.Realtime.initializing = false;
	
	//Add procedure block if the page is empty
	if(Blockly.Realtime.blocksMap_.isEmpty()) {
		var type = pageRoot.get('type');
		var block = Blockly.Block.obtain(Blockly.mainWorkspace, 'procedures_def' + type);
		block.initSvg();
		block.render();
	}
};

/**
 * Execute a command.  Generally, a command is the result of a user action
 * e.g., a click, drag or context menu selection.
 * @param {function()} cmdThunk A function representing the command execution.
 */
Blockly.Realtime.doCommand = function(cmdThunk) {
  // TODO(): We'd like to use the realtime API compound operations as in the
  // commented out code below.  However, it appears that the realtime API is
  // re-ordering events when they're within compound operations in a way which
  // breaks us.  We might need to implement our own compound operations as a
  // workaround.  Doing so might give us some other advantages since we could
  // then allow compound operations that span synchronous blocks of code (e.g.,
  // span multiple Blockly events).  It would also allow us to deal with the
  // fact that the current realtime API puts some operations into the undo stack
  // that we would prefer weren't there; namely local changes that occur as a
  // result of remote realtime events.
//  try {
//    Blockly.Realtime.model_.beginCompoundOperation();
//    cmdThunk();
//  } finally {
//    Blockly.Realtime.model_.endCompoundOperation();
//  }
  cmdThunk();
};

/**
 * Generate an id that is unique among the all the sessions that ever
 * collaborated on this document.
 * @param {string} extra A string id which is unique within this particular
 * session.
 * @return {string}
 */
Blockly.Realtime.genUid = function(extra) {
  /* FOR ZR: Uses random number instead of session ID. Chance of collisions is extremely low. 
   */
  var potentialUid = String(Math.random()) + '-' + extra;
  if (!Blockly.Realtime.blocksMap_.has(potentialUid)) {
    return potentialUid;
  } else {
    return (Blockly.Realtime.genUid('-' + extra));
  }
};
