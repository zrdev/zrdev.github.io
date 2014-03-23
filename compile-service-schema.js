General comments:
All these requests should be appropriately authenticated with an Authorization header containing a Google OAuth token. 
It's probably a good idea to have some kind of garbage collection that changes all compilations and simulations that still
say COMPILING or SIMULATING after an hour or so to FAILED. 

Creating snapshot:

POST request body:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"postSnapshotRequest",
	"type":"object",
	"required": ["fileId", "comment", "fileContent"],
	"properties": {
		"fileId": {
			"type": "string",
			"description": "Google Drive file ID for the project the snapshot is of"
		},
		"comment": {
			"type": "string",
			"description": "User-input comment describing the snapshot"
		},
		"fileContent": {
			"type": "string",
			"description": "JSON string containing all data in the project, stored as a single blob"
		},
	},
	"additionalProperties": false
}

Example:
{
	"fileId": "0Bw-IfABKvG5rLVMzbUhXUFEzUTg",
	"comment": "Some message",
	"fileContent": "arbitrary escaped JSON here"
}

The server:
*Inserts a new Snapshot into the database (and adds a timestamp)

Response body:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"postSnapshotResponse",
	"type":"object",
	"required": ["fileId", "snapshotId"],
	"properties": {
		"fileId": {
			"type": "string",
			"description": "Google Drive file ID for the project the snapshot is of"
		},
		"snapshotId": {
			"type": "integer",
			"description": "Primary key for created snapshot",
			"minimum": 1
		}
	},
	"additionalProperties": false
}

Example: 
{
	"fileId": "0Bw-IfABKvG5rLVMzbUhXUFEzUTg",
	"snapshotId": 347892
}

Retrieving snapshot(s):

GET parameters:
sendContent (boolean that indicates whether the contents of the file are to be sent)
EITHER snapshotId (integer, retrieves one snapshot by key)
OR fileId (string, retrieves all snapshots for that project)

Examples:
?snapshotId=347892&sendContent=true
?fileId=0Bw-IfABKvG5rLVMzbUhXUFEzUTg&sendContent=false

The server:
*Retrieves the requested snapshots

Response body:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"getSnapshotResponse",
	"type":"array",
	"items": {
		"type": "object",
		"description": "Snapshot resource",
		"required": ["snapshotId","fileId","comment","timestamp"],
		"properties": {
			"snapshotId": {
				"type": "integer",
				"description": "Primary key for snapshot",
				"minimum": 1
			},
			"fileId": {
				"type": "string",
				"description": "Google Drive file ID for the project the snapshot is of"
			},
			"comment": {
				"type": "string",
				"description": "User-input comment describing the snapshot"
			},
			"fileContent": {
				"type": "string",
				"description": "JSON string containing all data in the project, stored as a single blob (if requested)"
			},
			"timestamp": {
				"type": "integer",
				"description": "Timestamp in milliseconds past the epoch UTC",
				"minimum": 0
			}
		},
		"additionalProperties": false
	},
	"additionalProperties": false
}

Example:
[{
	"snapshotId": 347892,
	"fileId": "0Bw-IfABKvG5rLVMzbUhXUFEzUTg",
	"comment": "Some message",
	"fileContent": "arbitrary escaped JSON here",
	"timestamp": 1391144110462
},
{
	"snapshotId": 456456,
	"fileId": "0Bw-IASdbalhbLBSLIAUSD",
	"comment": "Some other message",
	"timestamp": 4574574747652
}]

Compiling:

POST request body to start compilation:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"startCompilationRequest",
	"type":"object",
	"required": ["gameId", "code", "codesize"],
	"properties": {
		"gameId": {
			"type": "integer",
			"description": "Primary key for the game",
			"minimum": 1
		},
		"code": {
			"type": "string",
			"description": "Code to be compiled"
		},
		"codesize": {
			"type": "boolean",
			"description": "Whether a codesize estimate is required. If true, compile with CCS; if false, g++."
		}
	},
	"additionalProperties": false
}

Example:
{
	"gameId": 4,
	"code": "void init() {} void loop() {}",
	"codesize": false
}

The server:
*Inserts a new Compilation entity into the database with status "COMPILING" (and a timestamp) and immediately returns its primary key. This is necessary because many 
proxies will time out HTTP requests after 90 seconds, so there must be a hook to renew the request if compilation takes longer than that. 
If we eventually move to WebSockets or some other real server-push transport, this two-step process can be eliminated. 
*Inserts the code into the zr.cpp template. This can now be done without reference to the game config, because all 
currently deployed games use the same template and any legacy games that are redeployed in the future will be refactored to use the same.
*Gets the name of the game from the database based on the ID number (should be heavily cached)
*Locates the game libraries
*If NOT codesize estimate: Compiles generated zr.cpp file using g++ with linkage against game .so libraries
*If codesize estimate: Compiles generated zr.cpp file using TI CCS with linkage against the sphlib project
*Writes status, message, and codesizePct into the Compilation row as explained below

Response body:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"startCompilationResponse",
	"type":"object",
	"required": ["compilationId"],
	"properties": {
		"compilationId": {
			"type": "integer",
			"description": "Primary key for the compilation",
			"minimum": 1
		}
	},
	"additionalProperties": false
}

Example: 
{
	"compilationId": 34598
}

Upon receiving this response, the client starts polling the server with getCompilation requests using the compilation PK it received:

GET parameters:
compilationId (integer, retrieves compilation by key)

Examples:
?compilationId=34598

Response body for getCompilation:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"getCompilationResponse",
	"type":"object",
	"required": ["compilationId", "status"],
	"properties": {
		"compilationId": {
			"type": "integer",
			"description": "Primary key for the compilation",
			"minimum": 1
		},
		"status": {
			"type": "string",
			"description": "COMPILING=still compiling, send another request; SUCCEEDED=compilation succeeded; FAILED=compilation failed",
			"enum": ["COMPILING", "SUCCEEDED", "FAILED"]
		},
		"message": {
			"type": "string",
			"description": "Any compiler warning or error messages. Should not be present if status is COMPILING. If compilation finishes with no messages, send empty string."
		},
		"codesizePct": {
			"type": "number",
			"description": "Percentage codesize use. Should be present only if status is SUCCEEDED and a codesize estimate was requested."
		},
		"timestamp": {
			"type": "integer",
			"description": "Timestamp in milliseconds past the epoch UTC",
			"minimum": 0
		}
	},
	"additionalProperties": false
}

Examples:
{
	"compilationId": 34598,
	"status": "COMPILING"
}
{
	"compilationId": 34598,
	"status": "SUCCEEDED",
	"message": "warning: at line 18: unused variable x",
	"codesizePct": 38,
	"timestamp": 3045987345
}

Simulation (uses a similar 2-step process):

POST request body to start sim:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"startSimulateRequest",
	"type":"object",
	"required": ["gameId", "code1", "code2", "simConfig"],
	"properties": {
		"gameId": {
			"type": "integer",
			"description": "Primary key for the game",
			"minimum": 1
		},
		"code1": {
			"type": "string",
			"description": "Code for SPH1"
		},
		"code2": {
			"type": "string",
			"description": "Code for SPH2"
		},
		"snapshot1": {
			"type": "integer",
			"description": "Primary key for snapshot of code for SPH1 (for recording purposes)",
			"minimum": 1
		},
		"snapshot2": {
			"type": "integer",
			"description": "Primary key for snapshot of code for SPH2 (for recording purposes)",
			"minimum": 1
		},
		"simConfig": {
			"type": "object",
			"description": "Sim configuration options",
			"required": ["timeout", "state1", "state2", "gameVariables"],
			"properties": {
				"timeout": {
					"type": "integer",
					"description": "Maximum simulation time in seconds including estimator convergence/initial positioning",
					"minimum": 1
				},
				"state1": {
					"type": "array",
					"description": "Initial state of SPH1: x, y, z position, followed by x, y, z attitude",
					"items": {
						"type": "number"
					},
					"minItems": 6,
					"maxItems": 6
				},
				"state2": {
					"type": "array",
					"description": "Initial state of SPH2: x, y, z position, followed by x, y, z attitude",
					"items": {
						"type": "number"
					},
					"minItems": 6,
					"maxItems": 6
				},
				"gameVariables": {
					"type": "array",
					"description": "Game-specific C global variables",
					"items": {
						"type": "object",
						"required": ["name", "value"],
						"properties": {
							"name": {
								"type": "string"
							},
							"value": {
								"type": "number"
							}
						},
						"additionalProperties": false
					}
				}
			},
			"additionalProperties": false
		}
	},
	"additionalProperties": false
}

Example:
{
	"gameId": 5,
	"code1": "void init() {} void loop() {}",
	"code2": "void init() { int x = 0; } void loop() {}",
	"snapshot1": 94857,
	"snapshot2": 203458,
	"simConfig": {
		"timeout": 240,
		"state1": [0.2, 0.65, 0.0, 0.0, 1.0, 0.0],
		"state2": [-0.2, 0.65, 0.0, 0.0, 1.0, 0.0],
		"gameVariables": [
			{
				"name": "cometConfig",
				"value": 3
			},
			{
				"name": "debrisConfig",
				"value": 1
			}
		]
	}
}
	
The server:
*Inserts a new Simulation entity into the database with status "COMPILING" (and a timestamp) and immediately returns its primary key. 
*Inserts the code into the zr.cpp template. 
*Gets the name of the game from the database based on the ID number
*Locates the game libraries
*Compiles generated zr.cpp file using g++ with linkage against game .so libraries. No need to add a Compilation to the database. 
*Adds any compiler warnings or errors to the simulation's message field
*If compilation fails: Changes simulation status to "FAILED" and aborts
*If compilation succeeds: Changes simulation status to "SIMULATING"
*Runs the simulation using the output code and ZR simulation library
*If simulation fails: Changes simulation status to "FAILED" and aborts
*If simulation succeeds: Changes simulation status to "SUCCEEDED" and writes JSON output to DB

Response body:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"startSimulationResponse",
	"type":"object",
	"required": ["simulationId"],
	"properties": {
		"simulationId": {
			"type": "integer",
			"description": "Primary key for the simulation",
			"minimum": 1
		}
	},
	"additionalProperties": false
}

Example: 
{
	"simulationId": 456523
}

Upon receiving this response, the client starts polling the server with getSimulation requests using the PK it received:

GET parameters:
sendContent (boolean, indicates whether the JSON simulation data is to be sent)
simulationId (integer, retrieves simulation by key)

Examples:
?simulationId=456523&sendContent=true

Response body for getSimulation:
{
	"$schema": "http://json-schema.org/schema#",
	"title":"getCompilationResponse",
	"type":"object",
	"required": ["simulationId", "status"],
	"properties": {
		"simulationId": {
			"type": "integer",
			"description": "Primary key for the simulation",
			"minimum": 1
		},
		"gameId": {
			"type": "integer",
			"description": "Primary key for the game",
			"minimum": 1
		},
		"status": {
			"type": "string",
			"description": "COMPILING=still compiling, send another request; SIMULATING=still simulating, send another request; SUCCEEDED=simulation succeeded; FAILED=simulation failed",
			"enum": ["COMPILING", "SIMULATING", "SUCCEEDED", "FAILED"]
		},
		"message": {
			"type": "string",
			"description": "Any compiler warning or error messages. Should not be present if status is COMPILING. If compilation finishes with no messages, send empty string."
		},
		"snapshot1": {
			"type": "integer",
			"description": "Primary key for snapshot of code for SPH1 (for recording purposes)",
			"minimum": 1
		},
		"snapshot2": {
			"type": "integer",
			"description": "Primary key for snapshot of code for SPH2 (for recording purposes)",
			"minimum": 1
		},
		"sph1Result": {
			"type": "integer",
			"description": "SPHERES test result number for SPH1",
			"minimum": 0,
			"maximum": 255
		},
		"sph2Result": {
			"type": "integer",
			"description": "SPHERES test result number for SPH2",
			"minimum": 0,
			"maximum": 255
		},
		"simData": {
			"type": "string",
			"description": "JSON simulation data"
		},
		"timestamp": {
			"type": "integer",
			"description": "Timestamp in milliseconds past the epoch UTC",
			"minimum": 0
		}
	},
	"additionalProperties": false
}

Examples:
{
	"simulationId": 456523,
	"status": "COMPILING"
}
{
	"simulationId": 456523,
	"gameId": 5,
	"status": "SUCCEEDED",
	"message": "warning: at line 18: unused variable x",
	"snapshot1": 94857,
	"snapshot2": 203458,
	"sph1Result": 51,
	"sph2Result": 11,
	"simData": "about 300KB of escaped JSON goes here",
	"timestamp": 98234751
}
