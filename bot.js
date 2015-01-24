var fs = require('fs');
var paper = require('paper');

var generator = require('./generator.js');
var lsystem = require('./lsystem.js');
var renderer = require('./renderer.js');
var twitterer = require('./twitterer.js');
twitterer.useCreds(JSON.parse(fs.readFileSync('./creds.json')));

// testing
/*
var avg = 0;
var retries = 0;
for(var i = 0; i < 1000; i++) {
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
*/

var action, retry;

action = function() {
    var system = generator.generate();
    var path = lsystem.expand(system, 10);

    if(path === null) {
        console.log('path not long enough, retrying...');
        retry();
        return;
    }

    renderer.render(path, function(imageFile) {
        console.log('tweeting:', JSON.stringify(system));

        twitterer.tweet(JSON.stringify(system), imageFile, undefined, function(error, res) {
            if(error || (res||{}).statusCode !== 200) {
                console.log('error tweeting:', error, (res||{}).body);
                retry();
            } else {
                console.log('tweet success');
            }
        });
    });
}

retry = function() {
    setTimeout(action, 5000);
}

action();
setInterval(action, 30*60*1000);
