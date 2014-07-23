var fs = require('fs'), util = require('util');
var Canvas = require('canvas');
var CanvasWrapper = require('./canvasWrapper.js');
var Twitter = require('./twitter.js');

var post = function(msg, image, callback) {
	callback = callback || function(){};
	var api = new Twitter(JSON.parse(fs.readFileSync('./creds.json')));
	api.post(msg, image,
	function(error, response) {
		if(error) {
			console.log(error);
		} else {
			console.log(response.body);
			console.log(new Date() + ' posted tweet with image: ' + msg);
			callback();
		}
	});
};

var randInt = function(n) {
	n = (n || 1) | 0;
	return Math.floor(Math.random() * n);
};

var pickRandom = function(elements) {
	return elements[randInt(elements.length)];
};

var generateCurve = function() {
	var caps = 'ABCDEGHIJKLMNOPQRSTUVWXYZ'.split('');
	var count = randInt(4)+1;
	var nodeSymbols = ['F'];
	var controlSymbols = ['F', '+', '-'];
	var start = '';
	var rules = {};
	var rule = '';
	var i = 0, j = 0, count = 0, index = 0;

	// select some symbols to use as nodes
	count = randInt(3)+2;
	for(i=0; i<count; i++) {
		index = randInt(caps.length);
		nodeSymbols.push(caps.splice(index, 1));
	}

	// generate random start symbol (small)
	count = randInt(6)+1;
	for(i=0; i<count; i++) {
		start += pickRandom(nodeSymbols);
	}

	// generate a rule for each symbol
	for(i=0;i<nodeSymbols.length; i++) {
		rule = '';

		// insert random node or control symbols
		count = randInt(20);
		for(j=0; j<count; j++) {
			rule += Math.random() > 0.5 ?
				pickRandom(nodeSymbols) :
				pickRandom(controlSymbols);
		}

		// replace random symbols with draw symbols for more visual appeal
		count = randInt(rule.length/2)+1;
		for(j=0; j<count; j++) {
			index = randInt(rule.length);
			rule = rule.substring(0, index) + 'F' + rule.substring(index+1);
		}

		// insert push/pop symbols, which need to be matched
		count = randInt(2);
		for(j=0; j<count; j++) {
			index = randInt(rule.length);
			rule = rule.substring(0, index) + '[' + rule.substring(index+1);
			index++;
			index = index + randInt(rule.length-index);
			rule = rule.substring(0, index) + ']' + rule.substring(index+1);
		}
		
		rules[nodeSymbols[i]] = rule;
	}

	// post process
	// remove empty push/pop
	// fit into 140 char - 23 for images

	return {
		'start': start,
		'rules': rules
	};
};

var expandCurve = function(start, rules, iterations) {
	var curve = start;
	var i = 0;
	for(; i<iterations; i++) {
		curve = Array.prototype.map.call(curve, function(char) {
			if(rules[char]) {
				return rules[char];
			} else {
				return char;
			}
		}).join('');
	}
	return curve;
};

var render = function(curveData, callback) {
	var start = curveData.start;
	var rules = curveData.rules;
	var startWidth = 2000, startHeight = 2000;
	var canvas = new Canvas(startWidth, startHeight);
	var ctx = new CanvasWrapper(canvas.getContext('2d'));
	var iterations = randInt(3)+2;
	var angle = Math.PI / (randInt(2)+2);
	var length = 20;

	var curve = expandCurve(start, rules, iterations);
	var bounds = {
		xmin:Infinity,
		xmax:-Infinity,
		ymin:Infinity,
		ymax:-Infinity
	};
	var addBounds = function(pt) {
		bounds.xmin = pt.x < bounds.xmin ? pt.x : bounds.xmin;
		bounds.xmax = pt.x > bounds.xmax ? pt.x : bounds.xmax;
		bounds.ymin = pt.y < bounds.ymin ? pt.y : bounds.ymin;
		bounds.ymax = pt.y > bounds.ymax ? pt.y : bounds.ymax;
	};

	var hue = randInt(360);
	var r = randInt(60) + 40;
	var sat = randInt(60) + 40;
	var lit = randInt(60) + 40;
	var color1 = 'rgb(' + r + ',' + sat + ',' + lit + ')';
	
	ctx.strokeStyle = color1;
	console.log('stroke: ' + ctx.strokeStyle);

	ctx.lineWidth = 4;
	ctx.translate(1000.5,1000.5);
	ctx.beginPath();
	console.log('rendering path: ' + curve);
	Array.prototype.map.call(curve, function(cmd) {
		switch(cmd) {
			case 'F': ctx.translate(0, -length); ctx.lineTo(0, 0); break;
			case 'f': ctx.translate(0, -length); ctx.moveTo(0, 0); break;
			case '-': ctx.rotate(-angle); break;
			case '+': ctx.rotate(+angle); break;
			case '[': ctx.save(); break;
			case ']': ctx.restore(); ctx.moveTo(0,0); break;
		}
		addBounds(ctx.getCoords(0,0));
	});
	ctx.stroke();

	bounds.xmin -= 5;
	bounds.xmax += 5;
	bounds.ymin -= 5;
	bounds.ymax += 5;
	console.log('bounds: ' + bounds.xmin + ',' + bounds.xmax + ',' + bounds.ymin + ',' + bounds.ymax);
	var width = bounds.xmax - bounds.xmin;
	var height = bounds.ymax - bounds.ymin;

	var cropCanvas = new Canvas(width, height);
	var cropContext = cropCanvas.getContext('2d');
	cropContext.translate(-bounds.xmin, -bounds.ymin);
	cropContext.drawImage(canvas, 0, 0);

	console.log('outputting image');
	var stream = cropCanvas.createPNGStream();
	var filename = __dirname + '/out.png';
	var out = fs.createWriteStream(filename);
	stream.on('data', function(chunk) {
		out.write(chunk);
	});
	stream.on('end', function() {
		out.end();
		setTimeout(callback.bind(null, './out.png'), 5000);
	});
	
};

var doAction = function() {
	console.log('doing action');
	var curveData = generateCurve();
	console.log(util.inspect(curveData));
	var tweet = util.inspect(curveData);
	render(curveData, function(image) {
		post(tweet, image, function() {
			// do something on success
		});
	});
};

doAction();
// repeat action
setInterval(doAction, 60*60*30);
