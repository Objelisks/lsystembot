var fs = require('fs');

var generator = require('./generator.js');
var lsystem = require('./lsystem.js');
var twitterer = require('./twitterer.js');
var mentionHandler = require('./mentionHandler.js');
twitterer.useCreds(JSON.parse(fs.readFileSync('./creds.json')));

/*
// testing

console.log('starting');
var path = null;
while(path === null) {
	var system = generator.generate();
	path = lsystem.expand(system, 100);
}
console.log('going to render');

var out = fs.createWriteStream(__dirname + '/text.png');
path.on('data', function(chunk){
  out.write(chunk);
});
path.on('end', function(){
  console.log('saved png');
});
*/


var action, retry;

action = function() {
    var system = generator.generate();
    var canvasStream = lsystem.expand(system, 10);

    if(canvasStream === null) {
        console.log('path not long enough, retrying...');
        retry();
        return;
    }

    console.log('tweeting:', JSON.stringify(system));

    twitterer.tweet(JSON.stringify(system), canvasStream, undefined, function(error, res) {
        if(error || (res||{}).statusCode !== 200) {
            console.log('error tweeting:', error, (res||{}).body);
            retry();
        } else {
            console.log('tweet success');
        }
    });

    mentionHandler.handleMentions(twitterer);
}

retry = function() {
    setTimeout(action, 5000);
}

action();
setInterval(action, 30*60*1000);
