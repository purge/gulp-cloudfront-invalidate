'use strict';

var gutil = require('gulp-util'),
    AWS = require('aws-sdk'),
    through = require('through2'),
    _ = require('underscore');

module.exports = function(credentials, options) {

  AWS.config.update(_.defaults(credentials, {
    accessKeyId: credentials.key,
    secretAccessKey: credentials.secret,
  }));

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
        Items: _.map(items, function(p) { return '/' + p; }),
      }
    };
    console.log(invalidationBatch);

    cloudfront.createInvalidation({
      DistributionId: options.distId,
      InvalidationBatch: invalidationBatch
    }, function(err, res) {
      if (err) {
        gutil.error('gulp-invalidate-cloudfront: ' + err);
        cb(false);
      } else {
        gutil.log('gulp-invalidate-cloudfront: created ' + res.Invalidation.Id);
        cb();
      }
    });
  }

  return through.obj(transformFn, flushFn);
};
