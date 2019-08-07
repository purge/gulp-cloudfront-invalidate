"use strict";

var log = require("fancy-log"),
  AWS = require("aws-sdk"),
  through = require("through2"),
  _ = require("underscore");

module.exports = function(credentials, options) {
  AWS.config.update(
    _.defaults(credentials, {
      accessKeyId: credentials.key,
      secretAccessKey: credentials.secret
    })
  );

  var items = [];
  function transformFn(file, enc, cb) {
    console.log(file.relative);
    items.push(file.relative);
    cb();
  }

  function flushFn(cb) {
    var cloudfront = new AWS.CloudFront();
    var invalidationBatch = {
      CallerReference: new Date().toString(),
      Paths: {
        Quantity: items.length,
        Items: _.map(items, function(p) {
          return "/" + p;
        })
      }
    };
    console.log(invalidationBatch);

    cloudfront.createInvalidation(
      {
        DistributionId: options.distId,
        InvalidationBatch: invalidationBatch
      },
      function(err, res) {
        if (err) {
          log.error("gulp-cloudfront-invalidate: " + err);
          log.error(res);
          cb(false);
        } else {
          log("gulp-cloudfront-invalidate: created " + res.Invalidation.Id);
          cb();
        }
      }
    );
  }

  return through.obj(transformFn, flushFn);
};
