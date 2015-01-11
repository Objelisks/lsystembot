var paper = require('paper');
var Rsvg = require('rsvg').Rsvg;
var stream = require('stream');
var fs = require('fs');

var project = new paper.Project();

function generatePath(start, rules, angle, iter, color) {
	var iterate = function(str, rules) {
		var out = '', result;
		str.split('').forEach(function(character) {
			result = rules[character];
			if(result) {
				out += result;
			} else {
				out += character;
			}
		});
		return out;
	};

    var system = start;
    for(var i=0; i<iter; i++) {
        system = iterate(system, rules);
    }

    var commands = system.split('');
    var currentPoint = new paper.Point(0, 0);
    var movement = new paper.Point(0, -10);
    var stack = [];
    var translations = {
        'F': function(path) { currentPoint = currentPoint.add([movement.x, movement.y]); path.lineTo(currentPoint); },
        '+': function(path) { movement = movement.rotate(angle, new paper.Point(0, 0)); },
        '-': function(path) { movement = movement.rotate(-angle, new paper.Point(0, 0)); },
        '[': function(path) { stack.push(currentPoint); stack.push(movement); },
        ']': function(path) { movement = stack.pop(); currentPoint = stack.pop(); path.moveTo(currentPoint); }
    };

    var path = new paper.CompoundPath();
    path.moveTo(currentPoint);
    commands.forEach(function(command) {
        var translation = translations[command];
        if(translation) {
            translation(path);
        }
    });

    path.strokeColor = color;
    path.strokeWidth = 1;
    //path.fitBounds(new Rectangle(
    return path;
}

var testStart = "ZY";
var rules = {
    "F": "RFF",
    "Z": "FZ+--RF+Z",
    "R": "Z-F-",
    "B": "Z-FZFFF+"
};

var lsystem = generatePath(testStart, rules, 60, 4, "blue");
var svg = lsystem.project.exportSVG({asString:true});
console.log(svg);
var rsvg = new Rsvg();
console.log('doing', rsvg);
rsvg.on('finish', function() {
    console.log('finished');
    console.log(rsvg.width);
    fs.writeFileSync('./tiger.png', rsvg.render({
        format: 'png',
        width: 1600,
        height: 1400
    }).data);
});

console.log('starting stream');

var transform = new stream.PassThrough();
transform.pipe(rsvg);
transform.write(svg);
transform.end();

console.log('done piping');
