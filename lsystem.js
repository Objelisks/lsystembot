var Canvas = require('canvas');

var width = 2048;
var height = 1024;

function chooseRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

exports.expand = function(system, minLength) {
  var canvas = new Canvas(width, height);
  var ctx = canvas.getContext('2d');

  var start = system.start;
  var rules = system.rules;
  var angle = system['a'] || chooseRandom([36, 45, 60, 90]);
  var iterations = system.iter || chooseRandom([3, 4, 5, 6, 7, 8, 9]);
  var hue = Math.random()*360;
  var saturation = Math.random()*0.8 + 0.2;
  var lightness = Math.random()*0.8 + 0.2;
  var color = `hsl(${hue}, ${saturation*100}%, ${lightness*100}%)`;

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
    if(system.length > 1000) {
      return null;
    }
  }

  var check = system.match(/F/g) || { length: 0 };

  if(check.length < minLength) {
      // restart
      return null;
  }

  var commands = system.split('');
  var stack = [];
  var translations = {
    'F': () => { ctx.translate(0, height/35); ctx.lineTo(0, 0); },
    '+': () => { ctx.rotate(-angle); },
    '-': () => { ctx.rotate(angle); },
    '[': () => { ctx.save(); },
    ']': () => { ctx.stroke(); ctx.restore(); }
  }

  ctx.fillStyle = `hsl(${hue}, ${saturation*100}%, ${100-lightness*100}%)`;
  ctx.fillRect(0,0,width,height);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.translate(width/2, height/2);
  ctx.beginPath();
  commands.forEach((cmd) => {
    var translation = translations[cmd];
    if(translation) {
      translation();
    }
  });
  ctx.stroke();

  return canvas.toBuffer();
}
