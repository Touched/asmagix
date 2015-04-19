'use strict';
var gaze = require('gaze');
var path = require('path');
var build = require('./build');

module.exports = function (config, rom, base) {
    var pattern = [path.join(config.src, '*.asm'), path.join(config.src, '*.s')];

    gaze(pattern, {cwd: base}, function (err, watcher) {
        this.on('all', function (event, filepath) {
            build(config, rom, base);
        });
    });
};