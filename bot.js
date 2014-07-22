var fs = require('fs'), util = require('util');
var Canvas = require('canvas');
var CanvasWrapper = require('./canvasWrapper.js');
var Twitter = require('twitter-js-client');

var post = function(msg, image, callback) {
	callback = callback || function(){};
	var api = new Twitter.Twitter(JSON.parse(fs.readFileSync('./creds.json')));
	api.post('/statuses/update_with_media', {
		'status': msg,
		'media[]': image
	}, function(error) {
		console.log(error);
	}, function(success) {
		console.log(new Date() + ' posted tweet with image: ' + msg);
		callback();
	});
};

var randInt = function(n) {
	n = n || 1;
	return Math.floor(Math.random() * n);
};

var takeRandom = function(elements) {
	return elements[randInt(elements.length)];
};

var generateCurve = function() {
	var caps = 'ABCDEGHIJKLMNOPQRSTUVWXYZ'.split('');
	var numSymbols = randInt(4)+1;
	var nodeSymbols = ['F'];
	var controlSymbols = ['F', '+', '-'];
	var start = '';
	var startChars = randInt(6)+1;
	var symbolIndex = 0;
	var rules = {};
	var rule = '';
	var ruleChars = 0;
	var minDraws = 0;
	var insertPos = 0;

	// select some symbols to use as nodes
	var i = 0, j = 0;
	for(i=0; i<numSymbols; i++) {
		symbolIndex = randInt(caps.length);
		nodeSymbols.push(caps.splice(symbolIndex, 1));
	}

	// generate random start symbol (small)
	for(i=0; i<startChars; i++) {
		start += takeRandom(nodeSymbols);
	}

	// generate a rule for each symbol
	for(i=0;i<nodeSymbols.length; i++) {
		rule = '';
		ruleChars = randInt(12);
		for(j=0; j<ruleChars; j++) {
			rule += Math.random() > 0.7 ?
				takeRandom(nodeSymbols) :
				takeRandom(controlSymbols);
		}
		console.log('rule: ' + rule);
		minDraws = randInt(Math.floor(rule.length/2))+1;
		for(j=0; j<minDraws; j++) {
			insertPos = randInt(rule.length);
			rule = rule.substr(0, insertPos) + 'F' + rule.substr(insertPos+1);
		}
		console.log('rule post: ' + rule);
		rules[nodeSymbols[i]] = rule;
	}

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

var render = function(curveData) {
	var start = curveData.start;
	var rules = curveData.rules;
	var canvas = new Canvas(2000, 2000);
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
	
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 2.5;
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
			case ']': ctx.restore(); break;
		}
		addBounds(ctx.getCoords(0,0));
	});
	ctx.stroke();

	bounds.xmin -= 5;
	bounds.xmax += 5;
	bounds.ymin -= 5;
	bounds.ymax += 5;
	console.log('bounds: ' + bounds.xmin + ',' + bounds.xmax + ',' + bounds.ymin + ',' + bounds.ymax);

	var cropCanvas = new Canvas(bounds.xmax - bounds.xmin, bounds.ymax - bounds.ymin);
	var cropContext = cropCanvas.getContext('2d');
	cropContext.translate(-bounds.xmin, -bounds.ymin);
	cropContext.drawImage(canvas, 0, 0);

	console.log('outputting image');
	var stream = cropCanvas.createPNGStream();
	var out = fs.createWriteStream(__dirname + '/out.png');
	stream.on('data', function(chunk) {
		out.write(chunk);
	});
	return out;
};

var doAction = function() {
	console.log('doing action');
	var curveData = generateCurve();
	console.log(util.inspect(curveData));
	var tweet = "genretaed a l-system curve: F+F-F-+-F++f";
	var image = render(curveData);
	//post(tweet, image, function() {
		// do something on success
	//});
};

doAction();
// repeat action
