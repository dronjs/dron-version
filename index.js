var queryRegEx = /^([\+]+)([a-z]*)$/;
var numberRegEx = /^[^0-9]+$/;

function filterNumbers(v) { // Remove literals
	return v.replace(numberRegEx, '');
}

function increaseMainVersion(version) {
	return version.split('.')
	.map(filterNumbers)
	.map(function(v, index) { return index===0 ? parseInt(v)+1 : (index===1||index===2 ? 0 : v); }).join('.');
}

function increaseMinorVersion(version) {
	return version.split('.')
	.map(filterNumbers)
	.map(function(v, index) { return index===1 ? parseInt(v)+1 : (index===2 ? 0 : v); }).join('.');
}

function increaseBuildVersion(version) {
	return version.split('.')
	.map(filterNumbers)
	.map(function(v, index) { return index===2 ? parseInt(v)+1 : v; }).join('.');
}

function help() {
	this.log('Usage: dron version <query>');
	this.log('where <query> is one of:');
	this.log('	+<literals> Increase build version');
	this.log('	++<literals> Increase minor version');
	this.log('	+++<literals> Increase major version');
	this.log('');
	this.log('where <literals> is alphabetic version.');
	return true;
}


/**
 * confirm - Ask user for confirmation of future version
 */
function confirm(json) {
	function write(props) {
		if (!props.accept) {
			return null;
		} else {
			this.touch('package.json').write(JSON.stringify(json, null, 2));
			if (props.message) {
				return this.run('gitcommit', {
	        message: props.message
	      });
			} else {
				return true;
			}
		}
	}

	write.prompt = function() {
		var isGit = this.touch('.git').isDirectory();
		
		return [
			{
				type: 'confirm',
				name: 'accept',
				message: json.version+' looks good?',
				default: true
			},
			{
				type: 'input',
				name: 'message',
				message: 'Enter Git commit message',
				default: isGit ? 'v'+json.version : '',
				when: function(a) {
					return a.accept&&isGit;
				}
			}
		]
	}

	return write;
}

function showCurrentVersion(json) {
	return function() {
		this.message('Current Npm version is '+json.version);
		return true;
	}
}

function increaseBuild(json, literals) {
	return function() {
		var version = increaseBuildVersion(json.version);
		if (literals) {
			version+=literals;
		}
		json.version = version;
		return confirm(json);
	}
}

function increaseMinor(json, literals) {
	return function() {
		var version = increaseMinorVersion(json.version);
		if (literals) {
			version+=literals;
		}
		json.version = version;
		return confirm(json);
	}
}

function increaseVersion(json, literals) {
	return function() {
		var version = increaseMainVersion(json.version);
		if (literals) {
			version+=literals;
		}
		json.version = version;
		return confirm(json);
	}
}

/**
 * Route
 */
function dronVersion(args) {
	return function() {
		var package = this.touch('package.json');
		if (!package.exists()) {
			this.warn('package.json is not exists');
			return null;
		} else {
			var json = package.require();

			if (!args._[1]) {
				return showCurrentVersion(json);
			} else {
				var options = args._[1].match(queryRegEx);

				if (!options) {
					this.warn('Invalid query string');
					return help;
				} else {
					if (options[1].length===1) {
						return increaseBuild(json, options[2]);
					} else if (options[1].length===2) {
						return increaseMinor(json, options[2]);
					} else if (options[1].length===3){
						return increaseVersion(json, options[2]);
					} else {
						this.warn('Invalid query string');
						return help;
					}
				}
			}
		}

	}
}

module.exports = function factory(argv) {
	return dronVersion(argv);
}
