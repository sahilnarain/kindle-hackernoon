const INSTA_URL = process.env.PARSER_ARTICLE + '?api_key=' + process.env.PARSER_KEY + '&url=';
const FEED_URL = 'https://hackernoon.com/feed';

var feed = require("feed-read");
var async = require('async');
var request = require('request');
var h2p = require('html-to-pdf');

async.waterfall([
  function (callback) {
    feed(FEED_URL, function (err, rss) {
      if (err) {
        return callback(err);
      }

      return callback(null, rss);
    });
  },

  function (rss, callback) {
    var dump = [];

    for (i = 0; i < rss.length; i++) {
      var info = {
        title: rss[i].title,
        author: rss[i].author,
        //link: rss[i].link,
        parseUrl: INSTA_URL + rss[i].link
      };
      dump.push(info)
    }
    return callback(null, dump);
  },

  function (dump, callback) {
    async.eachSeries(dump, function (article, done) {

      var options = {
        method: 'GET',
        url: article.parseUrl
      };

      request(options, function (err, response, body) {
        if (err) {
          return done(err);
        }

        body = JSON.parse(body);

        h2p.convertHTMLString(body.html, './pdf/' + article.title + '.pdf', function (err, success) {
          if (err) {
            return done(err);
          }

          setTimeout(function () {
            console.log('Converted: ' + article.title + ' by ' + article.author);
            return done(null);
          }, 1000)
        });

      }, function (err) {
        if (err) {
          return callback(err);
        }

        return callback(null);
      });
    });
  }
], function (err) {
  if (err) {
    console.log(err);
  }

  console.log('Done');
});