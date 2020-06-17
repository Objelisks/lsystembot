var fs = require('fs');
var lsystem = require('./lsystem.js');

var fileName = './lion.png';
var credsFile = './creds.json';

exports.handleMentions = function(twitterer) {
    var creds = JSON.parse(fs.readFileSync(credsFile));
    var last = creds.lastMention;

    console.log('checking mentions since', last);
    twitterer.getMentions(last, function(err, res) {
        if(err) {
            console.log('error getting mentions');
            return;
        } else {
            var mentions = JSON.parse(res.body);
            if(mentions.length === 0) return;

            mentions.forEach(function(mention) {
                try {
                    var text = mention.text;
                    var screenName = mention.user.screen_name;
                    var color = mention.user.profile_link_color;
                    var id = mention.id_str;

                    if(parseInt(id) > parseInt(last)) {
                        creds.lastMention = id;
                        fs.writeFileSync(progressFile, JSON.stringify(creds));
                    }

                    var system = JSON.parse(/{.*}/.exec(text));
                    console.log('found mention:', system);
                    if(system === null) return;

                    var path = lsystem.expand(system);
                    console.log('tweeting reply:', JSON.stringify(system));

                    twitterer.tweet('@' + screenName, path, id, function(error, res) {
                        if(error || (res||{}).statusCode !== 200) {
                            console.log('error tweeting:', error, (res||{}).body);
                        } else {
                            console.log('tweet success');
                        }
                    });
                } catch(e) {
                    console.log('mention not renderable or something', e);
                }
            });
        }
    });
}
