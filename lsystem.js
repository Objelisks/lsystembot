var paper = require('paper');
var project = new paper.Project();

exports.expand = function(system) {
    var start = system.start;
    var rules = system.rules;
    var angle = system['a'];
    var iterations = system.iter || 4;
    var color = system.color || new paper.Color(0, 0, 0);
    var smooth = system.wiggly || (Math.random() < 0.1);

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
    for(var i=0; i<iterations; i++) {
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
    path.strokeWidth = 1.5;
    path.fitBounds(new paper.Rectangle(20, 20, 2008, 984));

    if(smooth) {
        path.smooth();
    }

    return path;
}