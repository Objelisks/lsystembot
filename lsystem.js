var Canvas = require('canvas');
var fabric = require('fabric').fabric;

var width = 1024;
var height = 512;

function chooseRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

exports.expand = function(system, minLength) {
  //var canvas = new Canvas(width, height, 'svg');
  var canvas = fabric.createCanvasForNode(width, height);
  //var ctx = canvas.getContext('2d');

  var start = system.start;
  var rules = system.rules;
  var angle = system['a'] || chooseRandom([36, 45, 60, 90, Math.random()*360, Math.random()*360]);
  angle = angle * Math.PI / 180;
  var iterations = system.iter || chooseRandom([3, 4, 5, 6, 7, 8, 9]);
  var hue = Math.random()*360;
  var saturation = Math.random()*0.8 + 0.1;
  var lightness = Math.random()*0.8 + 0.1;
  lightness -= Math.abs(0.5-lightness) < 0.2 ? 0.3 : 0;
  var fgColor = `hsl(${hue}, ${saturation*100}%, ${lightness*100}%)`;
  var bgColor = `hsl(${hue}, ${saturation*100}%, ${100-lightness*100}%)`;

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

  var string = start;
  for(var i=0; i<iterations; i++) {
    string = iterate(string, rules);
  }

  var check = string.match(/F/g) || { length: 0 };

  if(check.length < minLength) {
      // restart
      return null;
  }


  let pathStr = 'M 0 0';
  let point = {x: 0, y: 0};
  let a = 0;
  let stack = [];
  let dist = 20;
  var translations = {
    'F': () => { point.x += Math.cos(a)*dist; point.y += Math.sin(a)*dist; pathStr += ` L ${point.x} ${point.y}`; },
    '+': () => { a -= angle; },
    '-': () => { a += angle; },
    '[': () => { stack.push({point: {x: point.x, y: point.y}, a: a}); },
    ']': () => { ({point: point, a: a} = stack.pop()); pathStr += ` M ${point.x} ${point.y}`; }
  }
  
  var commands = string.replace(/[^F+-\[\]]/g, '').split('');
  commands.forEach((cmd) => {
    var move = translations[cmd];
    if(move) {
      move();
    }
  });
  
  let path = new fabric.Path(pathStr);
  path.stroke = fgColor;
  path.strokeLineCap = 'round';
  path.strokeLineJoin = 'round';
  path.fill = 'none';
  canvas.backgroundColor = bgColor;
  canvas.add(path);
  let bounds = path.getBoundingRect();
  if(bounds.width === 1 || bounds.height === 1) return null;
  path.scaleToHeight(canvas.height*0.98);
  path.center();
  bounds = path.getBoundingRect();
  if(isNaN(bounds.width) || isNaN(bounds.height)) return null;
  canvas.renderAll();

  return canvas.nodeCanvas.toBuffer();
}
