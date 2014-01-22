/**
 * Loads the Game API
 * @returns {ZrApiGame}
 */
function ZrApiGame()
{
	
};

ZrApiGame.prototype = new ZrApi();
ZrApi.prototype.constructor = ZrApiGame;

/**
 * 'loop' is the main procedure.
 */
ZrApiGame.prototype.getMain = function(editor) {
    var main = editor.library.lookupProcedure('loop');
    return main;
};

/**
 * 'init' is a generated procedure for initialization.
 */
ZrApiGame.prototype.getInit = function(editor) {
    var init = editor.library.lookupProcedure('init');
    return init;
};

/**
 * Sets up the default or provided API
 */
ZrApiGame.prototype.setupApi = function(editor, apiElements) {
	if (typeof(apiElements) == 'undefined') {
		apiElements = staticAPI;
	}

	// add tabs
	if (apiElements.tabs) {
		for ( var int = 0; int < apiElements.tabs.length; int++) {
			this.addMenuTab(apiElements.tabs[int],editor);
		}
	}
	//Check to see if ZRUser must be added
	if (editor.library.lookupProcedure("loop") == null){
		apiElements.signatures.push("void __init::loop()");
	}
	
	if (apiElements.signatures) {
		this.addSignatures(apiElements.signatures,editor);
	}
	if (apiElements.aliases) {
		this.addAliases(apiElements.aliases,editor);
	}
};

var staticAPI = {
	tabs: ["SPHERES Controls", "Debug"],
	signatures: [ "void __init::init()",
	  "void __SPHERES_Controls::setPos(float x, float y, float z)", // Implemented in main class
	  "void SPHERES_Controls::getMyZRState(float forces[12])",
	  "void SPHERES_Controls::getOtherZRState(float forces[12])",
	  "void SPHERES_Controls::setPositionTarget(float posTarget[3])",
	  "void SPHERES_Controls::setAttitudeTarget(float attTarget[3])",
	  "void SPHERES_Controls::setVelocityTarget(float velTarget[3])",
	  "void SPHERES_Controls::setForces(float forces[3])",
	  "void SPHERES_Controls::setTorques(float torques[3])",
	  "unsigned int SPHERES_Controls::getTime()",
	  "void Debug::DEBUG(passthru expr)"],
	aliases: {
		x:  'ZRUser:myState[0]',
		y:  'ZRUser:myState[1]',
		z:  'ZRUser:myState[2]',
		vx: 'ZRUser:myState[3]',
		vy: 'ZRUser:myState[4]',
		vz: 'ZRUser:myState[5]',
		nx: 'ZRUser:myState[6]',
		ny: 'ZRUser:myState[7]',
		nz: 'ZRUser:myState[8]',
		wx: 'ZRUser:myState[9]',
		wy: 'ZRUser:myState[10]',
		wz: 'ZRUser:myState[11]',

		other_x:  'ZRUser:otherState[0]',
		other_y:  'ZRUser:otherState[1]',
		other_z:  'ZRUser:otherState[2]',
		other_vx: 'ZRUser:otherState[3]',
		other_vy: 'ZRUser:otherState[4]',
		other_vz: 'ZRUser:otherState[5]',
		other_nx: 'ZRUser:otherState[6]',
		other_ny: 'ZRUser:otherState[7]',
		other_nz: 'ZRUser:otherState[8]',
		other_wx: 'ZRUser:otherState[9]',
		other_wy: 'ZRUser:otherState[10]',
		other_wz: 'ZRUser:otherState[11]'    
	}
}
