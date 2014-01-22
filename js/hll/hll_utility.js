// Utility functions

function utility_getJson(source)
{
    return JSON.parse(JSON.stringify(source));
};

function utility_loadJson(target,json)
{
    // TODO: Replace KLUDGE "eval(new datatype())" trick with
    // something more standard. May require creating a factory
    // object that knows about every class we want to make.

    jQuery.extend(true,target,json);

    for (var prop in json) {
	if (json[prop] === null) {
	    continue;
	}
	var datatype = json[prop].datatype;
	var objtype = Object.prototype.toString.call(json[prop]);

	if (objtype === '[object Array]') {
	    for (var index = 0; index < json[prop].length; index++) {
		datatype = json[prop][index].datatype;
		objtype = Object.prototype.toString.call(json[prop][index]);
		if (datatype !== undefined) {
		    target[prop][index] = eval('new '+datatype+'();');
		    target[prop][index].loadJson(json[prop][index]);
		}
		else if (objtype === '[object Array]' ||
			 objtype === '[object Object]') {
		    utility_loadJson(target[prop][index],json[prop][index]);
		}
	    }
	}
	else if (datatype !== undefined) {
	    target[prop] = eval('new '+json[prop].datatype+'();');
	    target[prop].loadJson(json[prop]);
	}
	else if (objtype === '[object Array]' ||
		 objtype === '[object Object]') {
	    utility_loadJson(target[prop],json[prop]);
	}
    }
};
