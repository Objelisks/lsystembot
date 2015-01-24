var Rsvg = require('rsvg').Rsvg;
var fs = require('fs');
var stream = require('stream');

var fileName = './tiger.png';

exports.render = function(path, callback) {
    var svg = path.project.exportSVG({ asString:true });

    var rsvg = new Rsvg();
    rsvg.on('finish', function() {
        console.log('outputting image');
        // this defines the resulting image file size
        fs.writeFile(fileName, rsvg.render({
            format: 'png',
            width: 1024,
            height: 512
        }).data, function(err) {
		    if(err) {
                console.log('problem saving file:', err);
                return;
            }
            callback(fileName);
	    });
    });

    // send svg file to rsvg to render into png file
    var tube = new stream.PassThrough();
    tube.pipe(rsvg);
    tube.write(svg);
    tube.end();
}
