'use strict';
var gaze = require('gaze');
var path = require('path');

module.exports = function (config, rom, base) {
    var pattern = path.join(config.src, '*.{asm,s}');

    gaze(pattern, {cwd: base}, function (err, watcher) {

    });
};