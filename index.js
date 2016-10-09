/**
 Dron module `dron-version`*
*/
function increaseMinorVersion(version) {
	return version.split('.').map(function(v, index) { return index===1 ? parseInt(v)+1 : (index===2 ? 0 : v); }).join('.');
}

function increaseBuildVersion(version) {
	return version.split('.').map(function(v, index) { return index===2 ? parseInt(v)+1 : v; }).join('.');
}

function confirm(json) {
	function write(props) {
		if (!props.accept) {
			return null;
		} else {
			this.touch('package.json').write(JSON.stringify(json, null, 2));
			return this.run('gitcommit', {
        message: props.message
      });
		}
	}

	write.prompt = [
		{
			type: 'confirm',
			name: 'accept',
			message: json.version+' looks good?',
			default: true
		},
		{
			type: 'input',
			name: 'message',
			message: 'Enter commit message',
			default: 'v'+json.version,
			when: function(a) {
				return a.accept;
			}
		}
	]

	return write;
}

function dronVersion(args) {
	return function() {
		var package = this.touch('package.json');
		if (!package.exists()) {
			this.warn('package.json is not exists');
			return null;
		} else {
			var json = package.require();
			if (args.minor) {
				json.version = increaseMinorVersion(json.version);
			} else if (args.build) {
				json.version = increaseBuildVersion(json.version);
			} else {
				json.version = increaseBuildVersion(json.version);
			}

			return confirm(json);
		}

	}
}

module.exports = function factory(argv) {
	return dronVersion(argv);
}
