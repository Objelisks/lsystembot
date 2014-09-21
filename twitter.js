(function() {
  var fs, path, request, twitter_update_with_media, twitter_get_mentions;
 
  fs = require('fs');
 
  path = require('path');
 
  request = require('request');
 
 
  twitter_update_with_media = (function() {
    function twitter_update_with_media(auth_settings) {
      this.auth_settings = auth_settings;
      this.api_url = 'https://api.twitter.com/1.1/statuses/update_with_media.json';
    }
 
    twitter_update_with_media.prototype.post = function(status, file_path, reply, callback) {
      var form, r;
      r = request.post(this.api_url, {
        oauth: this.auth_settings
      }, callback);
      form = r.form();
      form.append('status', status);
      if(reply !== undefined) form.append('in_reply_to_status_id', reply);
      return form.append('media[]', fs.createReadStream(path.normalize(file_path)));
    };
 
    return twitter_update_with_media;
 
  })();

  twitter_get_mentions = (function() {
    function twitter_get_mentions(auth_settings) {
      this.auth_settings = auth_settings;
      this.api_url = 'https://api.twitter.com/1.1/statuses/mentions_timeline.json';
    }

    twitter_get_mentions.prototype.get = function(since_id, callback) {
      var form, r;
      r = request.get(this.api_url, {
        oauth: this.auth_settings,
        qs: {
          'since_id': since_id,
          'latest_results': true
        }
      }, callback);
      return;
    };

    return twitter_get_mentions;
  })();
 
  module.exports = {
    'update_with_media': twitter_update_with_media,
    'get_mentions': twitter_get_mentions
  };
 
}).call(this);
