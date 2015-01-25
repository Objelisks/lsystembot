var fs = require('fs');
var path = require('path');
var request = require('request');

var authSettings;

var useCreds = function(creds) {
    authSettings = creds;
};


// tweet with pictures
var updateWithMedia = function(status, filePath, reply, callback) {
    var form, r, url = 'https://api.twitter.com/1.1/statuses/update_with_media.json';

    r = request.post(url, {
        oauth: authSettings
    }, callback);

    form = r.form();
    form.append('status', status);
    if(reply !== undefined) {
        form.append('in_reply_to_status_id', reply);
    }
    form.append('media[]', fs.createReadStream(path.normalize(filePath)))

    return form;
};


// get all mentions since last checked
var getMentions = function(sinceId, callback) {
    var form, r, url = 'https://api.twitter.com/1.1/statuses/mentions_timeline.json';
    var qs = { 'latest_results': true };
    if(sinceId !== undefined) {
        qs['since_id'] = sinceId;
    }

    console.log(qs);

    r = request.get(url, {
        oauth: authSettings,
        qs: qs
    }, callback);

    return form;
};

module.exports = {
    useCreds : useCreds,
    tweet : updateWithMedia,
    getMentions : getMentions
}

