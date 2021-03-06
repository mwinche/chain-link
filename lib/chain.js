var From = require('./from');

var PATTERN_REGEX = /{\w+}/g;

function Chain(){
	this.paths = {};
	this.pathKeys = {};
	this.pathRegexes = {};

	this.from = new From();
}

function extractPathKeys(path) {
	var matchData = path.match(PATTERN_REGEX);

	if (!matchData) {
		matchData = [];
	}

	for (var i = 0; i < matchData.length; i++) {
		matchData[i] = matchData[i].substr(1, matchData[i].length - 2);
	}

	return matchData;
}

function extractPathRegex(path) {
	//Escape slashes
	path = path.replace(/\//g, "\\/");

	//Set up matching groups
	path = path.replace(/{\w+}/g, "(.+)");

	return new RegExp("^" + path + "$");
}

Chain.prototype.resource = function(path, source){
	this.paths[path] = source;
	this.pathKeys[path] = extractPathKeys(path);
	this.pathRegexes[path] = extractPathRegex(path);

	return this;
};

Chain.prototype.get = function(req){
	var that = this,
		matchedSource = this.paths[req], //do the easy way first for speed
		matches = {},
		matchedKeys = this.pathKeys[req];

	if(!matchedSource){
		Object.keys(this.paths).map(function(path){
			var matchData = that.pathRegexes[path].exec(req);

			if(matchData){
				matchedSource = that.paths[path];
				matchedKeys = that.pathKeys[path];

				matchedKeys.map(function(key, index){
					matches[key] = matchData[index + 1];
				});
			}
		});
	}

	if(!matchedSource){
		return null;
	}

	if(matchedSource.isResource){
		return this.get(matchedSource.resolve(matches));
	}

	return {
		keys: function keys(){
			return matchedKeys;
		},
		source: function source(){
			return matchedSource;
		},
		path: function path(){
			return req;
		},
		match: function match(){
			return matches;
		},
		resolve: function resolve(){
			return matchedSource.resolve(matches);
		}
	};
};

module.exports = function(){
	return new Chain();
};
