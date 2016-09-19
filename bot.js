var fs = require('fs');

var generator = require('./generator.js');
var lsystem = require('./lsystem.js');
var twitterer = require('./twitterer.js');
var mentionHandler = require('./mentionHandler.js');
twitterer.useCreds(JSON.parse(fs.readFileSync('./creds.json')));

var action, retry;

action = function() {
    var system = generator.generate();
    var canvasBuf = lsystem.expand(system, 10);

    if(canvasBuf === null) {
        console.log('path not good enough, retrying...');
        retry();
        return;
    }
    
    //fs.writeFileSync(__dirname + '/text.png', canvasBuf);

    console.log('tweeting:', JSON.stringify(system));

    twitterer.tweet(JSON.stringify(system), canvasBuf, undefined, function(error, res) {
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
    setTimeout(action, 1);
}

action();
setInterval(action, 30*60*1000);
