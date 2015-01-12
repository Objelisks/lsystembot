var paper = require('paper');
var Rsvg = require('rsvg').Rsvg;
var stream = require('stream');
var fs = require('fs');

//var generator = require('generator');
var lsystem = require('./lsystem.js');
//var twitterer = require('twitterer');

//var system = generator.generate();
//var imageFile = renderer.render(system);
//twitterer.tweet(system, imageFile);

var system = {
    start: "FEFE",
    rules: {
        "F": "FFBFBFCCCB++-",
        "E": "+E",
        "B": "",
        "C": "FFFBFB+E+EBC-CE-"
    },
    a: 45,
    iter: 5,
    color: "blue"
};

var path = lsystem.expand(system);
// this defines the region of the svg canvas that will be viewed
// centered around (0,0)
path.strokeJoin = 'bevel';
path.project.view.viewSize = new paper.Size(2048, 1024);
var svg = path.project.exportSVG({ asString:true });

var rsvg = new Rsvg();
rsvg.on('finish', function() {
    console.log('outputting image');
    // this defines the resulting image file size
    fs.writeFileSync('./tiger.png', rsvg.render({
        format: 'png',
        width: 2048,
        height: 1024
    }).data);
});

// send svg file to rsvg to render into png file
var tube = new stream.PassThrough();
tube.pipe(rsvg);
tube.write(svg);
tube.end();