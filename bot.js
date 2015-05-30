var fs = require('fs');

var generator = require('./generator.js');
var lsystem = require('./lsystem.js');
var renderer = require('./renderer.js');
var twitterer = require('./twitterer.js');
var mentionHandler = require('./mentionHandler.js');
twitterer.useCreds(JSON.parse(fs.readFileSync('./creds.json')));
/*
// testing

console.log('starting');
var avg = 0;
var retries = 0;
for(var i = 0; i < 100; i++) {
    var system = generator.generate();
    var path = lsystem.expand(system, 10);
    if(path === null) {
        retries++;
        continue;
    }
    avg = (avg + JSON.stringify(system).length) / 2;
}

console.log(avg);
console.log(retries);

var path = null;
while(path === null) {
	var system = generator.generate();
	path = lsystem.expand(system, 10);
}
console.log('going to render');
renderer.render(path, 'test.png', function() { console.log('success'); });
*/


var action, retry;
var fileName = './tiger.png';

action = function() {
    var system = generator.generate();
    var path = lsystem.expand(system, 10);

    if(path === null) {
        console.log('path not long enough, retrying...');
        retry();
        return;
    }

    renderer.render(path, fileName, function() {
        console.log('tweeting:', JSON.stringify(system));

        twitterer.tweet(JSON.stringify(system), fileName, undefined, function(error, res) {
            if(error || (res||{}).statusCode !== 200) {
                console.log('error tweeting:', error, (res||{}).body);
                retry();
            } else {
                console.log('tweet success');
            }
        });
    });

    mentionHandler.handleMentions(twitterer);
}

retry = function() {
    setTimeout(action, 5000);
}

action();
setInterval(action, 30*60*1000);

