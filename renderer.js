var svg2png = require('svg2png');
var fs = require('fs');

exports.render = function(path, fileName, callback) {
	var svg = path.project.exportSVG({asString:true});
	fs.writeFileSync('input.svg', svg);
	var out = svg2png('input.svg', fileName, function(err) {
		console.log(err, 'success');
		callback();
	});
}
