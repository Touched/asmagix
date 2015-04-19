'use strict';
var gaze = require('gaze');
var build = require('./build');
var util = require('./util');

module.exports = function (config, rom, base) {
    gaze(util.srcGlob(config), {cwd: base}, function (err, watcher) {
        this.on('all', function (event, filepath) {
            build(config, rom, base);
        });
    });
};